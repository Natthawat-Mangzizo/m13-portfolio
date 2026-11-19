// Challenge 4: Make It Remember
// Challenges 1-3 already work. Your mission: save and restore the Portfolio.
const form = document.querySelector('#profile-form');
const STORAGE_KEY = 'powerup-portfolio';

function showPortfolio(portfolio) {
    document.querySelector('#portfolio-name').textContent = portfolio.displayName;
    document.querySelector('#portfolio-enjoy').textContent = portfolio.whatIEnjoy;
    document.querySelector('#portfolio-tried').textContent = portfolio.whatIveTried;
    document.querySelector('#portfolio-curious').textContent = portfolio.whatImCuriousAbout;
}

async function loadPortfolios() {
    try {
        const response = await fetch('api/portfolios.php');
        const portfolios = await response.json();

        if (portfolios.length > 0) {
            const latestPortfolio = portfolios[portfolios.length - 1];
            showPortfolio(latestPortfolio);
        }
    } catch (error) {
        console.error('Could not load portfolios:', error);
    }
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.querySelector('#displayName').value.trim();
    const error = document.querySelector('#profile-error');

    if (name === '') {
        error.textContent = 'Please enter your name.';
        return;
    }
    error.textContent = '';

    const formData = new FormData(form);
    formData.set('displayName', name);
    formData.set('whatIEnjoy', document.querySelector('#enjoy').value.trim());
    formData.set('whatIveTried', document.querySelector('#tried').value.trim());
    formData.set('whatImCuriousAbout', document.querySelector('#curious').value.trim());

    await fetch('api/portfolios.php', {
        method: 'POST',
        body: formData
    });

    await loadPortfolios();
});

loadPortfolios();