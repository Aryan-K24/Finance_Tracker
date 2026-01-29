document.addEventListener('DOMContentLoaded', () => {
    const plannerForm = document.getElementById('plannerForm');
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const resetBtn = document.getElementById('resetBtn');
    const calculateBtn = document.getElementById('calculateBtn'); 
    const percentInput = document.getElementById('save-percent');

    function formatTime(totalMonths) {
        if (totalMonths < 12) {
            return `${totalMonths} ${totalMonths === 1 ? 'month' : 'months'}`;
        } else {
            const years = Math.floor(totalMonths / 12);
            const remainingMonths = totalMonths % 12;
            let yearText = `${years} ${years === 1 ? 'year' : 'years'}`;
            let monthText = remainingMonths > 0 ? ` and ${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}` : "";
            return yearText + monthText;
        }
    }

    plannerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Visual Feedback
        calculateBtn.disabled = true;
        calculateBtn.style.opacity = "0.7";
        calculateBtn.innerText = "Calculating... ⏳";
        resultBox.classList.add('hidden'); 

        // 2. The 3-second delay (3000ms)
        setTimeout(() => {
            const salary = parseFloat(document.getElementById('monthly-salary').value);
            const genSavings = parseFloat(document.getElementById('monthly-savings').value);
            const itemName = document.getElementById('item-name').value;
            const price = parseFloat(document.getElementById('item-price').value);
            
            let percent = parseFloat(percentInput.value);
            if (isNaN(percent)) {
                percent = 20; // Defaulting to 20%
                percentInput.value = 20;
            }

            const leftover = salary - genSavings;

            if (leftover <= 0) {
                alert("Your general savings goal is higher than your salary!");
                calculateBtn.disabled = false;
                calculateBtn.style.opacity = "1";
                calculateBtn.innerText = "Calculate Plan";
                return;
            }

            const itemSavingPerMonth = leftover * (percent / 100);
            const totalMonths = Math.ceil(price / itemSavingPerMonth);

            const timeString = formatTime(totalMonths);
            const fmtPrice = new Intl.NumberFormat('en-IN').format(price);
            const fmtLeftover = new Intl.NumberFormat('en-IN').format(leftover);
            const fmtItemSaving = new Intl.NumberFormat('en-IN').format(itemSavingPerMonth);

            // Phrase update
            resultText.innerHTML = `With a salary of <strong>₹${salary.toLocaleString('en-IN')}</strong> and a savings goal of <strong>₹${genSavings.toLocaleString('en-IN')}</strong>, your leftover budget is <strong>₹${fmtLeftover}</strong>. 
            By saving <strong>₹${fmtItemSaving} (${percent}%)</strong> from that every month, you can afford the <strong>${itemName}</strong> worth <strong>₹${fmtPrice}</strong> in <strong>${timeString}</strong>.`;

            // 3. Show Result
            resultBox.classList.remove('hidden');
            calculateBtn.disabled = false;
            calculateBtn.style.opacity = "1";
            calculateBtn.innerText = "Calculate Plan";
        }, 3000); // Changed to 3 seconds
    });

    resetBtn.addEventListener('click', () => {
        plannerForm.reset();
        percentInput.value = ""; 
        resultBox.classList.add('hidden');
    });
});