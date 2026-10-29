/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    let collection = new Collection({
        name: "orders",
        type: "base",
        fields: [
            { name: "order_id", type: "text", required: true, min: 6, max: 20 },
            { name: "product_id", type: "text" },
            { name: "product_name", type: "text", required: true },
            { name: "product_type", type: "text" },
            { name: "price", type: "number", required: true, onlyInt: true },
            { name: "customer_name", type: "text", required: true, min: 3 },
            { name: "mobile", type: "text", required: true, min: 10 },
            { name: "address", type: "text", required: true, min: 10 },
            {
                name: "status",
                type: "select",
                required: true,
                values: ["Pending", "Confirmed", "Dispatched", "Delivered"],
                maxSelect: 1,
            },
        ],
        indexes: [
            "CREATE UNIQUE INDEX idx_orders_order_id ON orders (order_id)",
        ],
        listRule: "",
        viewRule: "",
        createRule: "",
        updateRule: null,
        deleteRule: null,
    });

    app.save(collection);
}, (app) => {
    let collection = app.findCollectionByNameOrId("orders");
    if (collection) app.delete(collection);
});
