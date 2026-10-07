// Captures Mijaz gifting metadata (wax seal details, message card messages, polaroids) and saves them in Shopify cart attributes
document.addEventListener('DOMContentLoaded', () => {
  const saveGiftingAttributes = () => {
    const giftConfig = {
      attributes: {
        'Is Gift': 'Yes',
        'Gift Sender': document.querySelector('[name="gift-sender"]')?.value || '',
        'Gift Recipient': document.querySelector('[name="gift-recipient"]')?.value || '',
        'Card Message': document.querySelector('[name="gift-message"]')?.value || '',
        'Polaroid Caption': document.querySelector('[name="polaroid-caption"]')?.value || '',
        'Wax Seal Color': document.querySelector('[name="wax-seal-color"]')?.value || 'Gold',
        'Wax Sealed Letter Message': document.querySelector('[name="wax-letter-message"]')?.value || '',
        'Special Requests': document.querySelector('[name="special-request"]')?.value || ''
      }
    };

    fetch('/cart/update.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(giftConfig)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Shopify Cart Gifting Attributes Updated:', data);
    });
  };

  // Bind save event to Gifting Add to Cart triggers
  const giftSubmitBtn = document.querySelector('.gifting-submit-btn');
  if (giftSubmitBtn) {
    giftSubmitBtn.addEventListener('click', (e) => {
      saveGiftingAttributes();
    });
  }
});
