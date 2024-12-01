async function cleanTabs() {
    const tabs = await browser.tabs.query({});
    const uniqueTabs = new Map();

    let beforeCount = tabs.length;  // عدد التبويبات قبل التنظيف
    let removedCount = 0;  // عدد التبويبات المزالة
    let statsEnabled = false;

    // التحقق إذا كانت الإحصائيات مفعلّة
    const showStats = await browser.storage.local.get('showStats');
    statsEnabled = showStats.showStats || false;

    const chunkSize = 100;
    let start = 0;

    // عملية تنظيف التبويبات المكررة
    while (start < tabs.length) {
        const chunk = tabs.slice(start, start + chunkSize);
        await processChunk(chunk);  // تنظيف جزء من التبويبات
        start += chunkSize;
    }

    // بعد الانتهاء من عملية التنظيف، استعلام عدد التبويبات المتبقية
    const afterCount = (await browser.tabs.query({})).length;  // عدد التبويبات بعد التنظيف
    const duplicateCount = beforeCount - afterCount;  // حساب عدد التبويبات المكررة التي تمت إزالتها

    // إرجاع الإحصائيات
    return {
        beforeCount,
        afterCount,
        duplicateCount,
        statsEnabled
    };
}

// الدالة المسؤولة عن معالجة جزء من التبويبات
async function processChunk(chunk) {
    const uniqueTabs = new Map();
    for (const tab of chunk) {
        if (uniqueTabs.has(tab.url)) {
            browser.tabs.remove(tab.id); // إغلاق التبويب المكرر
        } else {
            uniqueTabs.set(tab.url, tab.id); // حفظ التبويب الفريد
        }
    }

    // السماح للمتصفح بالتنفس بين المعالجة
    await new Promise(resolve => setTimeout(resolve, 10)); // تحديد تأخير بسيط لتمكين المتصفح من التحديث
}

// استماع للرسائل الواردة من صفحة الإعدادات
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'cleanTabs') {
        try {
            cleanTabs().then(response => {
                sendResponse(response);
            });

        } catch (error) {
            sendResponse({ error: error.message });
        }
        return true; 
    }
});
