// Challenge 4: Make It Remember
// Challenges 1-3 already work. Your mission: save and restore the Portfolio.
const profileForm = document.querySelector('#profile-form');
const itemForm = document.querySelector('#item-form');
const portfolioList = document.querySelector('#portfolio-list');
const portfolioSelect = document.querySelector('#item-portfolio-id');

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

// แสดงรายการ Portfolios ทั้งหมดพร้อม Items ด้านใน
function renderPortfolios(portfolios) {
    // อัปเดตรายชื่อ Portfolio ใน Dropdown ของฟอร์มเพิ่ม Item
    if (portfolioSelect) {
        if (portfolios.length === 0) {
            portfolioSelect.innerHTML = '<option value="">-- Create a portfolio first --</option>';
        } else {
            portfolioSelect.innerHTML = portfolios
                .map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.displayName)}</option>`)
                .join('');
        }
    }

    if (!portfolioList) return;

    if (portfolios.length === 0) {
        portfolioList.innerHTML = `
            <div class="card p-4 shadow-sm border-0 rounded-4">
                <p class="text-muted mb-0">No portfolios yet. Create your first portfolio on the right!</p>
            </div>`;
        return;
    }

    portfolioList.innerHTML = portfolios.map(portfolio => {
        const items = Array.isArray(portfolio.items) ? portfolio.items : [];
        const itemsHtml = items.length === 0
            ? '<p class="text-muted small mb-0">No items added yet.</p>'
            : items.map(item => {
                const skillsText = Array.isArray(item.skills)
                    ? item.skills.join(', ')
                    : (item.skills || '');
                return `
                    <div class="border rounded-3 p-3 mb-2 bg-light">
                        <div class="fw-bold">${escapeHtml(item.title)}</div>
                        ${skillsText ? `<div class="small text-success mb-1"><strong>Skills:</strong> ${escapeHtml(skillsText)}</div>` : ''}
                        ${item.whatIDid ? `<div class="small"><strong>What I did:</strong> ${escapeHtml(item.whatIDid)}</div>` : ''}
                        ${item.evidence ? `<div class="small"><strong>Evidence:</strong> ${escapeHtml(item.evidence)}</div>` : ''}
                        ${item.nextStep ? `<div class="small"><strong>Next step:</strong> ${escapeHtml(item.nextStep)}</div>` : ''}
                    </div>
                `;
            }).join('');

        return `
            <div class="card p-4 mb-4 shadow-sm border-0 rounded-4">
                <div class="mb-2">
                    <span class="badge bg-secondary-subtle text-dark">Portfolio</span>
                </div>
                <h3 class="h4 fw-bold">${escapeHtml(portfolio.displayName)}</h3>
                <p class="mb-1"><strong>What I enjoy:</strong> ${escapeHtml(portfolio.whatIEnjoy)}</p>
                <p class="mb-1"><strong>What I've tried:</strong> ${escapeHtml(portfolio.whatIveTried)}</p>
                <p class="mb-3"><strong>What I'm curious about:</strong> ${escapeHtml(portfolio.whatImCuriousAbout)}</p>
                <hr>
                <h4 class="h6 fw-bold mb-2">Learning Items (${items.length})</h4>
                ${itemsHtml}
            </div>
        `;
    }).join('');
}

// 1. ดึงข้อมูล Portfolios + Items จากเซิร์ฟเวอร์
async function loadPortfolios() {
    try {
        const response = await fetch('api/portfolios.php');
        const portfolios = await response.json();
        renderPortfolios(portfolios);
    } catch (error) {
        console.error('Could not load portfolios:', error);
    }
}

// 2. บันทึก Portfolio ใหม่ (POST -> api/portfolios.php)
if (profileForm) {
    profileForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const errorEl = document.querySelector('#profile-error');
        const name = document.querySelector('#displayName').value.trim();

        if (name === '') {
            if (errorEl) errorEl.textContent = 'Please enter your name.';
            return;
        }
        if (errorEl) errorEl.textContent = '';

        const formData = new FormData(profileForm);
        const response = await fetch('api/portfolios.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            profileForm.reset();
            await loadPortfolios();
        } else if (errorEl) {
            errorEl.textContent = 'Failed to save portfolio.';
        }
    });
}

// 3. บันทึก Learning Item ใหม่ (POST -> api/items.php)
if (itemForm) {
    itemForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const itemErrorEl = document.querySelector('#item-error');

        const formData = new FormData(itemForm);
        const response = await fetch('api/items.php', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            if (itemErrorEl) itemErrorEl.textContent = '';
            itemForm.reset();
            await loadPortfolios();
        } else {
            const errData = await response.json().catch(() => ({}));
            if (itemErrorEl) {
                itemErrorEl.textContent = errData.error || 'Failed to save item. Please check your inputs.';
            }
        }
    });
}

// โหลดข้อมูลจากเซิร์ฟเวอร์ทันทีที่เปิดหน้าเว็บ
loadPortfolios();