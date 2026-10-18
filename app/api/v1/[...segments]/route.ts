import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Role = "owner" | "admin" | "manager" | "cashier" | "viewer";
type Context = { db: SupabaseClient; userId: string; role: Role; origin: string | null };
const env = (key: string) => process.env[key] || "";
const allowedRoles: Record<string, Role[]> = {
  read: ["owner", "admin", "manager", "cashier", "viewer"],
  manage: ["owner", "admin", "manager"],
  finance: ["owner", "admin", "manager"],
  pos: ["owner", "admin", "manager", "cashier"],
  owner: ["owner"]
};
const productSchema = z.object({ name:z.string().trim().min(1).max(120), sku:z.string().trim().max(80).optional().or(z.literal("")), category:z.string().trim().max(100).optional(), description:z.string().max(3000).optional(), price:z.coerce.number().positive().max(100000000), cost_price:z.coerce.number().min(0).max(100000000), stock:z.coerce.number().int().min(0).max(1000000), low_stock_threshold:z.coerce.number().int().min(0).max(1000000).optional() });
const expenseSchema = z.object({ amount:z.coerce.number().positive().max(100000000), category:z.string().trim().min(1).max(80), note:z.string().trim().max(500).optional(), expense_date:z.string().date() });
const orderStatuses = ["pending","dispatched","delivered"] as const;

function json(data:unknown,status=200,origin:string|null=null,extra:Record<string,string>={}) {
  const headers:Record<string,string>={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Vary":"Origin",...extra};
  if(origin) headers["Access-Control-Allow-Origin"]=origin;
  headers["Access-Control-Allow-Headers"]="Authorization, Content-Type, Idempotency-Key";
  headers["Access-Control-Allow-Methods"]="GET, POST, PATCH, OPTIONS";
  return Response.json(data,{status,headers});
}
function allowedOrigin(request:Request) {
  const origin=request.headers.get("origin");
  if(!origin)return null;
  const configured=env("ALLOWED_ORIGINS");
  const list=(configured || "https://admin.atbrand.store").split(",").map(x=>x.trim()).filter(Boolean);
  if(list.includes(origin))return origin;
  if(process.env.NODE_ENV!=="production" && /^https?:\/\/localhost(:\d+)?$/.test(origin))return origin;
  return "";
}
function client(url:string,key:string) { return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}}); }
async function authenticate(request:Request,required:Role[]) : Promise<Context> {
  const url=env("SUPABASE_URL"), pub=env("SUPABASE_PUBLISHABLE_KEY"), secret=env("SUPABASE_SECRET_KEY");
  if(!url||!pub||!secret)throw new Error("Server configuration is incomplete.");
  const auth=request.headers.get("authorization")||"";
  const token=auth.startsWith("Bearer ")?auth.slice(7):"";
  if(!token)throw Object.assign(new Error("Sign in required."),{status:401});
  const verifier=client(url,pub);
  const {data,error}=await verifier.auth.getUser(token);
  if(error||!data.user)throw Object.assign(new Error("Session is invalid or expired."),{status:401});
  const db=client(url,secret);
  const {data:profile,error:profileError}=await db.from("user_profiles").select("role,is_active").eq("id",data.user.id).maybeSingle();
  if(profileError)throw new Error("Could not verify staff permissions. Apply the database migration first.");
  if(!profile||profile.is_active===false||!required.includes(profile.role as Role))throw Object.assign(new Error("You do not have permission for this action."),{status:403});
  return {db,userId:data.user.id,role:profile.role as Role,origin:request.headers.get("origin")};
}
function assertOrigin(request:Request) { const origin=allowedOrigin(request); if(origin==="")throw Object.assign(new Error("This website is not allowed to access the API."),{status:403}); return origin; }
function fail(error:unknown,origin:string|null=null) { const e=error as Error & {status?:number}; const status=e.status||500; return json({error:status>=500?"server_error":"request_error",message:status>=500?"The request could not be completed.":e.message},status,origin); }
async function audit(db:SupabaseClient,actor:string,action:string,entity:string,entityId:string|null,metadata:unknown={}) { await db.from("audit_logs").insert({actor_id:actor,action,entity,entity_id:entityId,metadata}); }

async function handle(request:Request, segments:string[]) {
  let origin:string|null=null;
  try {
    origin=assertOrigin(request);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{...(origin?{"Access-Control-Allow-Origin":origin}:{}),"Access-Control-Allow-Headers":"Authorization, Content-Type, Idempotency-Key","Access-Control-Allow-Methods":"GET, POST, PATCH, OPTIONS","Vary":"Origin"}});
    if(segments.join("/")==="health"&&request.method==="GET")return json({ok:true,service:"at-brand-store-api"},200,origin);
    const path=segments.join("/");
    if(path==="auth/login")return json({message:"Use Supabase Auth signInWithPassword from the admin page, then send its access token as a Bearer token."},200,origin);
    if(path==="orders"&&request.method==="POST") {
      const key=request.headers.get("idempotency-key")||"";
      if(!/^[a-zA-Z0-9-]{16,100}$/.test(key))return json({error:"validation_error",message:"A valid Idempotency-Key header is required."},400,origin);
      const schema=z.object({customer_name:z.string().trim().min(2).max(120),phone:z.string().trim().min(7).max(30),address:z.string().trim().min(8).max(1000),items:z.array(z.object({product_id:z.string().min(1),quantity:z.number().int().min(1).max(100)})).min(1).max(50)}).safeParse(await request.json());
      if(!schema.success)return json({error:"validation_error",message:schema.error.issues[0]?.message||"Invalid order."},400,origin);
      const url=env("SUPABASE_URL"),secret=env("SUPABASE_SECRET_KEY");if(!url||!secret)throw new Error("Server configuration is incomplete.");
      const db=client(url,secret),fee=Number(env("DELIVERY_FEE_PKR")||0);
      if(!Number.isFinite(fee)||fee<0||fee>100000)throw new Error("Invalid delivery fee configuration.");
      const {data,error}=await db.rpc("create_online_order",{p_items:schema.data.items,p_customer_name:schema.data.customer_name,p_phone:schema.data.phone,p_address:schema.data.address,p_delivery_fee:fee,p_idempotency_key:key});
      if(error){if(error.message?.includes("INSUFFICIENT_STOCK"))return json({error:"insufficient_stock",message:"One or more items no longer have enough stock."},409,origin);if(error.message?.includes("PRODUCT_NOT_FOUND"))return json({error:"product_unavailable",message:"One or more products are unavailable."},409,origin);throw error;}
      return json({data},201,origin);
    }

    let ctx:Context;
    if(path==="admin/reports/summary")ctx=await authenticate(request,allowedRoles.finance);
    else if(path==="admin/expenses")ctx=await authenticate(request,allowedRoles.finance);
    else if(path==="pos/sales")ctx=await authenticate(request,allowedRoles.pos);
    else if(path==="admin/products"||path.startsWith("admin/products/"))ctx=await authenticate(request,request.method==="GET"?allowedRoles.read:allowedRoles.manage);
    else if(path==="admin/orders"||path.startsWith("admin/orders/"))ctx=await authenticate(request,path==="admin/orders"&&request.method==="GET"?allowedRoles.read:allowedRoles.manage);
    else if(path==="admin/me")ctx=await authenticate(request,allowedRoles.read);
    else return json({error:"not_found",message:"API route not found."},404,origin);
    ctx.origin=origin;

    if(path==="admin/me"&&request.method==="GET")return json({data:{id:ctx.userId,role:ctx.role}},200,origin);

    if(path==="admin/products"&&request.method==="GET") {
      const url=new URL(request.url),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||50),1),100),search=(url.searchParams.get("search")||"").trim().slice(0,80);
      let query=ctx.db.from("products").select("*").order("created_at",{ascending:false}).limit(limit);
      if(search)query=query.ilike("name",`%${search.replace(/[%_,]/g,"")}%`);
      const {data,error}=await query;if(error)throw error;return json({data:data||[]},200,origin);
    }
    if(path==="admin/products"&&request.method==="POST") {
      const form=request.headers.get("content-type")?.includes("multipart/form-data")?await request.formData():null;
      const raw=form?Object.fromEntries(["name","sku","category","description","price","cost_price","stock","low_stock_threshold"].map(k=>[k,form.get(k)??undefined])):await request.json();
      const parsed=productSchema.safeParse(raw);if(!parsed.success)return json({error:"validation_error",message:parsed.error.issues[0]?.message||"Invalid product."},400,origin);
      let imageUrl="";
      const image=form?.get("image");
      if(image instanceof File&&image.size){
        if(image.size>5*1024*1024||!/^image\/(jpeg|png|webp)$/.test(image.type))return json({error:"validation_error",message:"Image must be JPG, PNG or WebP and under 5 MB."},400,origin);
        const ext=image.type.split("/")[1].replace("jpeg","jpg"),objectPath=`products/${crypto.randomUUID()}.${ext}`;
        const {error:uploadError}=await ctx.db.storage.from("product-images").upload(objectPath,await image.arrayBuffer(),{contentType:image.type,upsert:false});
        if(uploadError)throw uploadError;
        imageUrl=ctx.db.storage.from("product-images").getPublicUrl(objectPath).data.publicUrl;
      }
      const {data,error}=await ctx.db.from("products").insert({...parsed.data,sku:parsed.data.sku||null,category:parsed.data.category||null,description:parsed.data.description||null,image_url:imageUrl,is_active:true}).select().single();
      if(error)throw error;
      if(Number(data.stock)>0)await ctx.db.from("inventory_movements").insert({product_id:String(data.id),actor_id:ctx.userId,quantity_delta:Number(data.stock),reason:"initial_stock"});
      await audit(ctx.db,ctx.userId,"product.created","product",String(data.id),{name:data.name});return json({data},201,origin);
    }
    if(path.startsWith("admin/products/")&&request.method==="PATCH") {
      if(path.endsWith("/stock")) {
        const id=decodeURIComponent(path.split("/")[2]||""),body=await request.json();
        const parsed=z.object({quantity_delta:z.number().int().min(-1000000).max(1000000).refine(x=>x!==0),reason:z.string().trim().min(2).max(120)}).safeParse(body);
        if(!id||!parsed.success)return json({error:"validation_error",message:parsed.success?"Product id is required.":parsed.error.issues[0]?.message||"Invalid stock change."},400,origin);
        const {data,error}=await ctx.db.rpc("adjust_product_stock",{p_product_id:id,p_quantity_delta:parsed.data.quantity_delta,p_reason:parsed.data.reason,p_actor:ctx.userId});
        if(error){if(error.message?.includes("INSUFFICIENT_STOCK"))return json({error:"insufficient_stock",message:"Stock cannot be reduced below zero."},409,origin);if(error.message?.includes("PRODUCT_NOT_FOUND"))return json({error:"not_found",message:"Product not found."},404,origin);throw error;}
        await audit(ctx.db,ctx.userId,"inventory.adjusted","product",id,{delta:parsed.data.quantity_delta,reason:parsed.data.reason});return json({data},200,origin);
      }
      const id=decodeURIComponent(path.split("/")[2]||"");if(!id)return json({error:"validation_error",message:"Product id is required."},400,origin);
      const form=request.headers.get("content-type")?.includes("multipart/form-data")?await request.formData():null;
      const raw:any=form?Object.fromEntries(["name","sku","category","description","price","cost_price","is_active"].map(k=>[k,form.get(k)??undefined])):await request.json();
      if(form&&raw.is_active!==undefined)raw.is_active=raw.is_active==="true";
      const schema=productSchema.omit({stock:true}).partial().extend({is_active:z.boolean().optional()}).safeParse(raw);
      if(!schema.success||Object.keys(schema.data||{}).length===0)return json({error:"validation_error",message:schema.success?"No product fields supplied.":schema.error.issues[0]?.message||"Invalid product."},400,origin);
      const patch:Record<string,unknown>={...schema.data,updated_at:new Date().toISOString()};
      if("sku" in patch)patch.sku=patch.sku||null;
      if("category" in patch)patch.category=patch.category||null;
      if("description" in patch)patch.description=patch.description||null;
      const image=form?.get("image");
      if(image instanceof File&&image.size){
        if(image.size>5*1024*1024||!/^image\/(jpeg|png|webp)$/.test(image.type))return json({error:"validation_error",message:"Image must be JPG, PNG or WebP and under 5 MB."},400,origin);
        const ext=image.type.split("/")[1].replace("jpeg","jpg"),objectPath=`products/${crypto.randomUUID()}.${ext}`;
        const {error:uploadError}=await ctx.db.storage.from("product-images").upload(objectPath,await image.arrayBuffer(),{contentType:image.type,upsert:false});if(uploadError)throw uploadError;
        patch.image_url=ctx.db.storage.from("product-images").getPublicUrl(objectPath).data.publicUrl;
      }
      const {data,error}=await ctx.db.from("products").update(patch).eq("id",id).select().single();if(error)throw error;
      await audit(ctx.db,ctx.userId,"product.updated","product",id,{fields:Object.keys(patch)});return json({data},200,origin);
    }
    if(path==="admin/orders"&&request.method==="GET") {
      const url=new URL(request.url),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||50),1),100);let q=ctx.db.from("orders").select("*").order("created_at",{ascending:false}).limit(limit);
      const status=url.searchParams.get("status");if(status&&status!=="all")q=q.eq("status",status);
      const search=(url.searchParams.get("search")||"").trim().slice(0,80);if(search)q=q.ilike("customer_name",`%${search.replace(/[%_,]/g,"")}%`);
      const {data,error}=await q;if(error)throw error;return json({data:data||[]},200,origin);
    }
    if(path.startsWith("admin/orders/")&&path.endsWith("/status")&&request.method==="PATCH") {
      const parts=path.split("/"),id=decodeURIComponent(parts[2]||""),body=await request.json(),status=z.enum(orderStatuses).safeParse(body.status);
      if(!id||!status.success)return json({error:"validation_error",message:"Invalid order or status."},400,origin);
      const {data:old,error:readError}=await ctx.db.from("orders").select("status").eq("id",id).single();if(readError)throw readError;
      const transitions:Record<string,string[]>={pending:["dispatched"],dispatched:["delivered"],delivered:[]};
      if(!transitions[old.status]?.includes(status.data))return json({error:"invalid_transition",message:`Cannot move order from ${old.status} to ${status.data}.`},409,origin);
      const {data,error}=await ctx.db.from("orders").update({status:status.data}).eq("id",id).select().single();if(error)throw error;
      await audit(ctx.db,ctx.userId,"order.status_changed","order",id,{from:old.status,to:status.data});return json({data},200,origin);
    }
    if(path==="pos/sales"&&request.method==="POST") {
      const key=request.headers.get("idempotency-key")||"";if(!/^[a-zA-Z0-9-]{16,100}$/.test(key))return json({error:"validation_error",message:"A valid Idempotency-Key header is required."},400,origin);
      const body=await request.json(),schema=z.object({items:z.array(z.object({product_id:z.string().min(1),quantity:z.number().int().min(1).max(10000)})).min(1).max(100),payment_method:z.enum(["cash","card","bank_transfer","other"])}).safeParse(body);
      if(!schema.success)return json({error:"validation_error",message:schema.error.issues[0]?.message||"Invalid sale."},400,origin);
      const {data,error}=await ctx.db.rpc("create_pos_sale",{p_items:schema.data.items,p_payment_method:schema.data.payment_method,p_idempotency_key:key,p_actor:ctx.userId});
      if(error){if(error.message?.includes("INSUFFICIENT_STOCK"))return json({error:"insufficient_stock",message:"One or more items no longer have enough stock."},409,origin);throw error;}
      await audit(ctx.db,ctx.userId,"pos.sale_created","pos_sale",String(data?.sale_id||data?.id||""),{total:data?.total_amount});return json({data},201,origin);
    }
    if(path==="admin/expenses"&&request.method==="GET") {
      const url=new URL(request.url),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||50),1),100);let q=ctx.db.from("expenses").select("*").order("expense_date",{ascending:false}).limit(limit);
      if(url.searchParams.has("from"))q=q.gte("expense_date",url.searchParams.get("from")!);if(url.searchParams.has("to"))q=q.lte("expense_date",url.searchParams.get("to")!);
      const {data,error}=await q;if(error)throw error;return json({data:data||[]},200,origin);
    }
    if(path==="admin/expenses"&&request.method==="POST") {
      const parsed=expenseSchema.safeParse(await request.json());if(!parsed.success)return json({error:"validation_error",message:parsed.error.issues[0]?.message||"Invalid expense."},400,origin);
      const {data,error}=await ctx.db.from("expenses").insert({...parsed.data,created_by:ctx.userId,note:parsed.data.note||null}).select().single();if(error)throw error;
      await audit(ctx.db,ctx.userId,"expense.created","expense",String(data.id),{amount:data.amount,category:data.category});return json({data},201,origin);
    }
    if(path==="admin/reports/summary"&&request.method==="GET") {
      const url=new URL(request.url),from=url.searchParams.get("from"),to=url.searchParams.get("to");
      const range=(q:any,column="created_at")=>{if(from)q=q.gte(column,from);if(to)q=q.lte(column,to+"T23:59:59.999Z");return q;};
      let oq=range(ctx.db.from("orders").select("total_amount,status",{count:"exact"}));
      let pq=range(ctx.db.from("pos_sales").select("total_amount,total_cost",{count:"exact"}));
      let payq=range(ctx.db.from("payments").select("amount,status",{count:"exact"}),"created_at");
      let eq=ctx.db.from("expenses").select("amount",{count:"exact"});if(from)eq=eq.gte("expense_date",from);if(to)eq=eq.lte("expense_date",to);
      const [orders,pos,payments,expenses,lowStock]=await Promise.all([oq,pq,payq,eq,ctx.db.from("products").select("id",{count:"exact",head:true}).lte("stock",0)]);
      for(const r of [orders,pos,payments,expenses,lowStock])if(r.error)throw r.error;
      const orderRows=orders.data||[],posRows=pos.data||[],paidRows=(payments.data||[]).filter((x:any)=>x.status==="succeeded"||x.status==="paid"),expenseRows=expenses.data||[];
      const recognizedOrders=orderRows.filter((x:any)=>x.status==="delivered"),online=recognizedOrders.reduce((s:number,x:any)=>s+Number(x.total_amount||0),0),posSales=posRows.reduce((s:number,x:any)=>s+Number(x.total_amount||0),0),collected=paidRows.reduce((s:number,x:any)=>s+Number(x.amount||0),0),expenseTotal=expenseRows.reduce((s:number,x:any)=>s+Number(x.amount||0),0);
      const orderIds=recognizedOrders.map((x:any)=>x.id);
      const {data:orderItems,error:itemError}=orderIds.length?await ctx.db.from("order_items").select("order_id,line_cost").in("order_id",orderIds):{data:[],error:null};
      if(itemError)throw itemError;
      const itemCounts=new Map<string,number>(),incompleteItemCosts=new Set<string>();for(const item of orderItems||[]){const id=String(item.order_id);itemCounts.set(id,(itemCounts.get(id)||0)+1);if(item.line_cost==null)incompleteItemCosts.add(id)}
      const legacyOrders=recognizedOrders.filter((x:any)=>!itemCounts.has(String(x.id))||incompleteItemCosts.has(String(x.id))).length;
      const knownCogs=posRows.reduce((s:number,x:any)=>s+Number(x.total_cost||0),0)+(orderItems||[]).reduce((s:number,x:any)=>s+Number(x.line_cost||0),0);
      const summary={online_sales:online,pos_sales:posSales,collected_payments:collected,orders_count:orders.count||orderRows.length,expenses:expenseTotal,cost_of_goods:knownCogs,gross_profit:legacyOrders?null:online+posSales-knownCogs,net_profit:legacyOrders?null:online+posSales-knownCogs-expenseTotal,profit_data_complete:legacyOrders===0,orders_without_item_cost_snapshots:legacyOrders,low_stock_count:lowStock.count||0};
      return json({data:{metrics:summary,range:{from,to}}},200,origin);
    }
    return json({error:"method_not_allowed",message:"Method not allowed."},405,origin,{Allow:"GET, POST, PATCH, OPTIONS"});
  } catch(error) { return fail(error,origin); }
}

export async function OPTIONS(request:Request){try{const origin=assertOrigin(request);return new Response(null,{status:204,headers:{...(origin?{"Access-Control-Allow-Origin":origin}:{}),"Access-Control-Allow-Headers":"Authorization, Content-Type, Idempotency-Key","Access-Control-Allow-Methods":"GET, POST, PATCH, OPTIONS","Vary":"Origin"}})}catch(e){return fail(e)}}
export async function GET(request:Request,{params}:{params:Promise<{segments:string[]}>}){return handle(request,(await params).segments)}
export async function POST(request:Request,{params}:{params:Promise<{segments:string[]}>}){return handle(request,(await params).segments)}
export async function PATCH(request:Request,{params}:{params:Promise<{segments:string[]}>}){return handle(request,(await params).segments)}
