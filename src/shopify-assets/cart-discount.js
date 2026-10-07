// Automatically checks the Shopify cart total and applies dynamic notifications/calculations
document.addEventListener('DOMContentLoaded', () => {
  const CART_DISCOUNT_THRESHOLD = 2499; // Rs. 2499
  
  const onCartChange = (cart) => {
    const totalWithNoDiscount = cart.total_price / 100; // Shopify prices are in cents
    
    if (totalWithNoDiscount >= CART_DISCOUNT_THRESHOLD) {
      const discountAmount = totalWithNoDiscount * 0.10;
      const discountedTotal = totalWithNoDiscount - discountAmount;
      console.log(`Mijaz Discount: 10% Applied. Saved: Rs. ${discountAmount}. New Total: Rs. ${discountedTotal}`);
      
      const discountLabel = document.querySelector('.cart-discount-label');
      if (discountLabel) {
        discountLabel.textContent = `FLAT 10% OFF Applied (-Rs. ${discountAmount.toFixed(2)})`;
        discountLabel.style.display = 'block';
      }
    } else {
      const remainingForDiscount = CART_DISCOUNT_THRESHOLD - totalWithNoDiscount;
      console.log(`Add Rs. ${remainingForDiscount} more to receive a flat 10% discount!`);
      const discountLabel = document.querySelector('.cart-discount-label');
      if (discountLabel) discountLabel.style.display = 'none';
    }
  };

  // Bind to Shopify cart change fetch requests
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    if (args[0] && (args[0].includes('/cart/add') || args[0].includes('/cart/change') || args[0].includes('/cart/clear') || args[0].includes('/cart/update'))) {
      const clone = response.clone();
      try {
        const cart = await clone.json();
        onCartChange(cart);
      } catch (e) {
        // Fallback
      }
    }
    return response;
  };
});
