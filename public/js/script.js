// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// Search autocomplete functionality
const searchInput = document.getElementById('search-input');
const suggestionsBox = document.getElementById('suggestions');

if (searchInput && suggestionsBox) {
  let debounceTimer;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < 2) {
      suggestionsBox.classList.remove('show');
      suggestionsBox.innerHTML = '';
      return;
    }
    
    debounceTimer = setTimeout(() => {
      fetch(`/listings?search=${encodeURIComponent(query)}`)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const listings = doc.querySelectorAll('.listing-link');
          
          if (listings.length > 0) {
            suggestionsBox.innerHTML = '';
            const maxResults = Math.min(listings.length, 5);
            
            for (let i = 0; i < maxResults; i++) {
              const listing = listings[i];
              const title = listing.querySelector('.card-text b')?.textContent || 'Unknown';
              const href = listing.getAttribute('href');
              
              const suggestionItem = document.createElement('div');
              suggestionItem.className = 'suggestion-item';
              suggestionItem.textContent = title;
              suggestionItem.onclick = () => {
                window.location.href = href;
              };
              
              suggestionsBox.appendChild(suggestionItem);
            }
            
            suggestionsBox.classList.add('show');
          } else {
            suggestionsBox.innerHTML = '<div class="suggestion-item">No results found</div>';
            suggestionsBox.classList.add('show');
          }
        })
        .catch(err => {
          console.error('Search error:', err);
          suggestionsBox.classList.remove('show');
        });
    }, 300);
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!document.querySelector('.position-relative')?.contains(e.target)) {
      suggestionsBox.classList.remove('show');
      suggestionsBox.innerHTML = '';
    }
  });
}