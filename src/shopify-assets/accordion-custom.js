// Toggles display panels for packaging details, scent profiles, and customizations inside Shopify product page templates
document.addEventListener('DOMContentLoaded', () => {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function() {
      this.classList.toggle('active');
      const panel = this.nextElementSibling;
      
      if (panel && panel.classList.contains('accordion-panel')) {
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
          panel.style.paddingTop = '0px';
          panel.style.paddingBottom = '0px';
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
          panel.style.paddingTop = '12px';
          panel.style.paddingBottom = '12px';
        }
      }
    });
  });
});
