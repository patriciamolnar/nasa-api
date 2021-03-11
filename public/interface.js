window.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.querySelector('.search-form')

    const showSearch = document.getElementById('show-search-btn'); 
    showSearch.addEventListener('click', () => {
        if(searchForm.classList.contains('appear')) {
            searchForm.classList.remove('appear');
            showSearch.textContent = 'Look up specific date';
        } else {
            searchForm.classList.add('appear');
            showSearch.textContent = 'Close';
        }
    });

    //show outline when user starts tabbing
    document.body.addEventListener('keyup', function(e) {
        if (e.key === 'Tab') {
          document.documentElement.classList.remove('no-focus-outline');
        }
    });
});