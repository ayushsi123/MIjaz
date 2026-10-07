// Headless Shopify Storefront & Admin API client integrations for Mijaz Luxury.
const SHOPIFY_DOMAIN = import.meta.env.VITE_SHOPIFY_DOMAIN || '0i0awx-em.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || '186d8896b8a796bb76f33d1e91341670';
// Using env variable for admin token to prevent secret leak
const ADMIN_ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_ADMIN_TOKEN || '';
const API_VERSION = '2024-01';

async function shopifyFetch<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const url = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });
    
    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    if (result.errors) {
      throw new Error(`GraphQL Errors: ${JSON.stringify(result.errors)}`);
    }
    
    return result.data as T;
  } catch (error) {
    console.error('Shopify fetch failed:', error);
    throw error;
  }
}

// Fetch all products from Shopify storefront
export async function fetchShopifyProducts() {
  const query = `
    query getProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  
  const data = await shopifyFetch<{ products: { edges: Array<{ node: any }> } }>(query);
  return data.products.edges.map(edge => {
    const node = edge.node;
    
    // Parse variants sizes & prices
    const sizes = node.variants.edges.map((v: any) => v.node.title);
    const prices: Record<string, number> = {};
    const salePrices: Record<string, number> = {};
    
    node.variants.edges.forEach((v: any) => {
      const sizeTitle = v.node.title;
      const comparePrice = v.node.compareAtPrice ? parseFloat(v.node.compareAtPrice.amount) : parseFloat(v.node.price.amount);
      const salePrice = parseFloat(v.node.price.amount);
      prices[sizeTitle] = comparePrice;
      salePrices[sizeTitle] = salePrice;
    });

    const isOil = node.productType.toLowerCase().includes('oil');

    return {
      id: node.id,
      name: node.title,
      handle: node.handle,
      category: isOil ? 'Oil' : 'Perfume',
      gender: 'Unisex', // Default fallback
      occasion: 'Day',  // Default fallback
      sizes: sizes.length > 0 ? sizes : ['50ml'],
      prices: Object.keys(prices).length > 0 ? prices : { '50ml': 700 },
      salePrices: Object.keys(salePrices).length > 0 ? salePrices : { '50ml': 600 },
      notes: [],
      img: node.images.edges[0]?.node.url || '',
      description: node.description || ''
    };
  });
}

// Create a Shopify Checkout Session
export async function createShopifyCheckout(lineItems: Array<{ variantId: string, quantity: number, customProperties?: Record<string, string> }>) {
  const mutation = `
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  // Format line items for Shopify Storefront API mutation
  const shopifyLineItems = lineItems.map(item => {
    const customAttributes = item.customProperties 
      ? Object.entries(item.customProperties).map(([key, value]) => ({ key, value }))
      : [];

    return {
      variantId: item.variantId,
      quantity: item.quantity,
      customAttributes: customAttributes.length > 0 ? customAttributes : undefined
    };
  });

  const variables = {
    input: {
      lineItems: shopifyLineItems
    }
  };

  const data = await shopifyFetch<{ checkoutCreate: { checkout: { webUrl: string }, checkoutUserErrors: any[] } }>(mutation, variables);
  
  if (data.checkoutCreate.checkoutUserErrors && data.checkoutCreate.checkoutUserErrors.length > 0) {
    throw new Error(`Checkout creation failed: ${data.checkoutCreate.checkoutUserErrors[0].message}`);
  }

  return data.checkoutCreate.checkout.webUrl;
}
