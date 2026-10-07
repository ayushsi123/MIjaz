// JavaScript controller for Shopify Custom Gifting Builder (page.gifting.liquid)
document.addEventListener('DOMContentLoaded', () => {
  const selectedItems = new Map(); // variantId -> { price, title, size }
  let includeRigidBox = false;

  const getIncludeBox = () => includeRigidBox;
  const getIncludePolaroid = () => document.getElementById('include-polaroid')?.checked || false;
  const getIncludeWaxSeal = () => document.getElementById('include-wax-seal')?.checked || false;

  // Toggle variant selection
  const itemButtons = document.querySelectorAll('.gift-item-toggle');
  itemButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const variantId = this.dataset.variantId;
      const price = parseFloat(this.dataset.price.replace(/,/g, ''));
      const title = this.dataset.name;
      const size = this.dataset.size;

      if (selectedItems.has(variantId)) {
        selectedItems.delete(variantId);
        this.classList.remove('bg-[#800000]', 'text-white', 'border-[#800000]');
        this.classList.add('bg-white', 'text-gray-600', 'border-gray-200');
      } else {
        selectedItems.set(variantId, { price, title, size });
        this.classList.add('bg-[#800000]', 'text-white', 'border-[#800000]');
        this.classList.remove('bg-white', 'text-gray-600', 'border-gray-200');
      }
      updateTotal();
    });
  });

  // Toggle Rigid box
  const boxToggle = document.getElementById('toggle-rigid-box');
  if (boxToggle) {
    boxToggle.addEventListener('click', function() {
      includeRigidBox = !includeRigidBox;
      if (includeRigidBox) {
        this.classList.add('border-[#800000]', 'bg-[#800000]/2');
      } else {
        this.classList.remove('border-[#800000]', 'bg-[#800000]/2');
      }
      updateTotal();
    });
  }

  // Toggle Polaroid details
  const polaroidCheckbox = document.getElementById('include-polaroid');
  const polaroidInput = document.getElementById('polaroid-caption');
  if (polaroidCheckbox && polaroidInput) {
    polaroidCheckbox.addEventListener('change', function() {
      if (this.checked) {
        polaroidInput.classList.remove('hidden');
      } else {
        polaroidInput.classList.add('hidden');
      }
      updateTotal();
    });
  }

  // Toggle Wax Seal details
  const waxCheckbox = document.getElementById('include-wax-seal');
  const waxFields = document.getElementById('wax-seal-fields');
  if (waxCheckbox && waxFields) {
    waxCheckbox.addEventListener('change', function() {
      if (this.checked) {
        waxFields.classList.remove('hidden');
      } else {
        waxFields.classList.add('hidden');
      }
      updateTotal();
    });
  }

  // Live Total Cost Calculator
  const updateTotal = () => {
    let itemsSum = 0;
    selectedItems.forEach(item => { itemsSum += item.price; });

    const boxCost = includeRigidBox ? 200 : 0;
    const polaroidCost = getIncludePolaroid() ? 99 : 0;
    const waxCost = getIncludeWaxSeal() ? 49 : 0;

    const grandTotal = itemsSum + boxCost + polaroidCost + waxCost;
    const totalLabel = document.getElementById('live-total-cost');
    if (totalLabel) {
      totalLabel.textContent = `Rs. ${grandTotal.toLocaleString()}`;
    }
  };

  // Submit Items to Shopify Cart
  const submitBtn = document.getElementById('submit-custom-gift');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      if (selectedItems.size === 0) {
        alert("Please select at least one fragrance or oil to include in your box!");
        return;
      }

      // Build Shopify Cart Line Items array
      const itemsPayload = [];
      const itemTitles = [];
      
      selectedItems.forEach((item, variantId) => {
        itemTitles.push(`${item.title} (${item.size})`);
        
        // Add individual products to cart with line item properties attached
        itemsPayload.push({
          id: parseInt(variantId),
          quantity: 1,
          properties: {
            'Box Content For': 'Mijaz Custom Curated Gift Box',
            'To': document.getElementById('gift-to')?.value || '',
            'From': document.getElementById('gift-from')?.value || '',
            'Card Message': document.getElementById('gift-card-text')?.value || '',
            'Packaging': includeRigidBox ? 'Premium Rigid Cardboard Box' : 'Standard Cardboard Box',
            'Polaroid Photo': getIncludePolaroid() ? 'Yes' : 'No',
            'Polaroid Caption': getIncludePolaroid() ? (document.getElementById('polaroid-caption')?.value || '') : '',
            'Wax Seal': getIncludeWaxSeal() ? 'Yes' : 'No',
            'Wax Color': getIncludeWaxSeal() ? (document.getElementById('wax-seal-color')?.value || 'Gold') : '',
            'Wax Envelope Message': getIncludeWaxSeal() ? (document.getElementById('wax-letter-message')?.value || '') : '',
            'Special Request Approval Required': document.getElementById('special-request-text')?.value || ''
          }
        });
      });

      // Submit all items at once to Shopify cart endpoint
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: itemsPayload })
      })
      .then(response => response.json())
      .then(data => {
        console.log('Custom Box successfully submitted to Shopify Cart:', data);
        window.location.href = '/cart'; // Redirect to cart page
      })
      .catch(error => {
        console.error('Error submitting custom box to Shopify:', error);
        alert('Failed to add custom box to cart. Please try again.');
      });
    });
  }
});
