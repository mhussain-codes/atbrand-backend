import React from 'react';
import { Helmet } from 'react-helmet';

// Social + canonical tags only. The page's own <Helmet> must keep a literal
// <title> and <meta name="description">, because the llms.txt build step reads
// those two tags straight out of the page file's source.
const Seo = ({ 
    title = "AT Brand Sargodha | Mens Premium Unstitched Suits", 
    description = "Shop mens premium unstitched suits and shalwar kameez at AT Brand Sargodha. Buy the best Wash & Wear, Ahmad Cotton, Boski, and Khaddar online in Pakistan.", 
    image = "https://atbrand-store-218737.hostingersite.com/wp-content/uploads/2026/09/logo-scaled.jpeg", 
    url, 
    siteName = "AT Brand Sargodha", 
    type = 'website' 
}) => {
    const canonical = url || window.location.origin + window.location.pathname;

    return (
        <Helmet>
            <link rel="canonical" href={canonical} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={type} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}

export default Seo;
export { Seo };