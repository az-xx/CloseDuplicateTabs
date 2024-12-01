document.addEventListener('DOMContentLoaded', function () {
    // تحميل إعدادات الإحصائيات
    browser.storage.local.get('showStats', function (data) {
        document.getElementById('showStats').checked = data.showStats || false;
    });

    // تغيير حالة الإعدادات
    document.getElementById('showStats').addEventListener('change', function () {
        browser.storage.local.set({
            showStats: document.getElementById('showStats').checked
        });
    });

    // عند الضغط على زر "Clean Duplicate Tabs"
    document.getElementById('cleanTabsBtn').addEventListener('click', function () {

        browser.runtime.sendMessage({ action: 'cleanTabs' }).then(response => {
            console.log('Tabs cleaned:', response);
            // التحقق إذا كان هناك استجابة من الخلفية
            if (response && response.statsEnabled) {
                document.getElementById('beforeCount').textContent = `Tabs before cleanup: ${response.beforeCount}`;
                document.getElementById('afterCount').textContent = `Tabs after cleanup: ${response.afterCount}`;
                document.getElementById('duplicateCount').textContent = `Removed duplicates: ${response.duplicateCount}`;
            } else if (response && response.error) {
                console.error('Error cleaning tabs:', response.error);
            }
        }).catch(err => {
            console.error('Error in sending message:', err);
        });

    });
});

