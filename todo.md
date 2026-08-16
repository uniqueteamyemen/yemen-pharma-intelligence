# Project TODO

- [x] Extract medicine records from the 2019 and 2022 Yemen National Essential Medicines List source files.
- [x] Normalize medicine names, strengths, dosage forms, and categories into one canonical catalog.
- [x] Preserve 2019/2022 source provenance and resolve duplicate entries.
- [x] Import the unified medicine catalog into the application database.
- [x] Validate catalog data in the platform and document the import results.
- [x] Audit and correct malformed medicine names, strengths, dosage forms, and source section labels from PDF extraction.
- [x] Run duplicate and near-duplicate quality checks and document their resolution.
- [x] Verify representative 2019 and 2022 records through the Drugs API and interface.
- [x] Verify 2019-only, 2022-only, and shared medicines through the Drugs API and record the exact sample results.
- [x] Fix Vite HMR WebSocket connection failure in the managed preview URL.

# Localization and Bilingual Search

- [x] Inspect and extend the existing localization architecture without creating a parallel system.
- [x] Make Arabic the default language with persisted Arabic/English switching and RTL/LTR support.
- [x] Localize all visible platform UI strings, validation, notifications, authentication, dashboards, catalog, and onboarding.
- [x] Add Arabic medicine-name mappings without changing canonical medicine keys or duplicating catalog records.
- [x] Implement shared Arabic/English search normalization in API and frontend.
- [x] Audit catalog integrity and test Arabic/English responsive behavior before delivery.


# UX Improvements Batch

- [x] توطين صفحات العروض والطلبات والنماذج ورسائل التحقق والإشعارات
- [x] توطين صفحات الحساب والجهات والمطابقات والرسائل والتحليلات
- [x] إخفاء شارات ومعلومات NEML 2019/2022 من واجهة المستخدم مع الحفاظ على provenance داخلياً
- [x] تحسين عرض الكتالوج والبحث العربي والإنجليزي وإظهار الاسمين عند توفرهما
- [x] إضافة رسالة واضحة بأن المطابقة تعتمد على اسم الدواء ولا تتطلب تطابق الكمية
- [x] اختبار تدفق Offer/Request/Match/Notification وصفحة المطابقات
- [x] تنفيذ QA نهائي للـ RTL/LTR والموبايل والنماذج
- [x] تحديث التقرير النهائي وحفظ checkpoint بعد اكتمال جميع البنود

# إصلاحات متابعة

- [x] تشخيص وإصلاح فشل اتصال tRPC في صفحة العروض (/dashboard/offers)
- [x] إصلاح ظهور نتائج الأدوية عند إدخال بادئة عربية في البحث
- [x] تتبع وإصلاح تدفق المطابقة الاسمية من العرض والطلب إلى matches والإشعارات
- [x] توثيق تأجيل اختبار القبول الشامل لصفحة /dashboard/offers واستجابات tRPC وتدفق إنشاء العرض حتى توفر حساب حقيقي، وفق الاتفاق السابق

# مراجعة ما قبل 25 أغسطس

- [x] إجراء تدقيق شامل للمنصة وتحديد الأولويات التقنية والتشغيلية قبل 25 أغسطس
- [x] تقييم مصادر عامة للأسماء التجارية وتحديد أن الترخيص شرط قبل أي ربط أو استيراد
- [x] تقييم مصادر الجهات الصحية العامة دون إنشاء حسابات أو مستخدمين غير مصرح بهم
- [x] تصميم مسار دليل جهات غير موثق مع مطالبة وتوثيق لاحقين بدلاً من حسابات مزيفة
- [x] إعداد خارطة تنفيذ مفصّلة لما قبل 25 أغسطس وما بعده مع قرارات مطلوبة من المالك
- [x] إعداد مسودة طلب ترخيص بيانات الأسماء التجارية وقائمة قبول الملف المستلم
- [x] إعداد سيناريو اختبار قبول إنشاء العرض والمطابقة والإشعار بعد 25 أغسطس
- [x] توسيع جدول الكتالوج ليشمل حقول الأسماء التجارية والشركات المصنعة والمستوردة
- [x] دمج الأسماء التجارية المعروفة مع المادة الفعالة في الكتالوج
- [x] تطوير محرك البحث والربط الثنائي ليشمل الاسم التجاري واسم الشركة المصنعة
- [x] تشغيل اختبارات الوحدة والتحقق من سلامة البناء والبحث والتصنيف
- [x] توثيق وتجهيز خطة اختبار قبول إنشاء العرض والمطابقة بحساب حقيقي لما بعد 25 أغسطس
- [x] إصلاح منع إرسال كمية عرض أقل من 1 من واجهة /dashboard/offers
- [x] اختبار رسائل الكمية والقيم الحدية قبل إرسال العرض
- [x] التحقق من واجهة وتكامل التحقق للكميات الحدية في نموذج العروض وتوثيق النتيجة
- [x] إنشاء صفحة About (اعرف المزيد) لتعريف المنصة والأهداف والحدود وأدوار الجهات مقارنة بالمنصات المشابهة
- [x] ربط زر اعرف المزيد في الصفحة الرئيسية وتوطين المحتوى بالعربية والإنجليزية
- [x] فحص بئية المعاينة وبناء الإنتاج والتحقق من سلامة التنقل
- [x] إصلاح مسار الاستيراد الثابت لصفحة About في App.tsx واجتياز فحص البناء والتحقق بنجاح
- [x] إضافة قسم الأسئلة الشائعة (FAQ) الثنائي اللغة في صفحة "اعرف المزيد" (About) وتوضيح طبيعة المنصة
- [x] إنشاء مهارة جديدة قابلة لإعادة الاستخدام (`pharma-market-intelligence`) تلخص منهج بناء منصات ذكاء السوق الدوائي
- [x] إعادة تصميم Hero section للصفحة الرئيسية ليعكس قيمة منصة الذكاء السوقي دون تحويلها إلى عرض شرائح
- [x] إضافة قسم المشكلة والحل المختصر في الصفحة الرئيسية مع دعم العربية والإنجليزية
- [x] إضافة قسم «كيف تعمل المنصة؟» يشرح التسجيل والعرض أو الطلب والمطابقة والإشعار
- [x] إبراز الكتالوج الموحد ومحرك المطابقة كميزات سوقية رئيسية في الصفحة الرئيسية
- [x] إضافة بطاقات مستقلة للجهات المستهدفة في الصفحة الرئيسية
- [x] نقل ملخص الخطة والقنوات إلى صفحة اعرف المزيد فقط، بعيداً عن رحلة المستخدم الأساسية
- [x] اختبار الاستجابة والتوطين والبناء والتحقق البصري لتحديث الواجهة
- [x] تشغيل فحوصات محلية وسحابية عامة لا تتطلب تسجيل دخول أو إنشاء بيانات تشغيلية قبل الحفظ
- [x] توثيق مرحلة لاحقة بعد بدء التشغيل: لوحة مؤشرات عامة موثوقة لاحتياج السوق والمخزون ومخزون الطوارئ، من دون بيانات تجريبية تظهر للمستخدمين
- [x] توثيق مرحلة لاحقة بعد اعتماد المصادر: ربط لوحة المؤشرات بمزيج موثق من بيانات المنصة وبيانات السوق اليمني الخارجية المرخصة، مع إسناد المصدر ودرجة الثقة وفصل المنهجية
- [x] صياغة نظام هوية بصرية لمنصة PharmaYemen حول مفهوم الأمن الدوائي والذكاء السوقي
- [x] إنشاء رمز شعار أصلي قابل للاستخدام مع علامة نصية عربية/إنجليزية موحدة
- [x] تطبيق الهوية والشعار الجديدين على الصفحة الرئيسية وصفحة اعرف المزيد
- [x] توثيق توزيع أقسام الصورة المرجعية بين الصفحات العامة والحالية والمستقبلية للمنصة
- [x] اختبار الهوية الجديدة على العربية والإنجليزية والموبايل وبناء الإنتاج
