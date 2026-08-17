export const therapeuticCategories = [
  { value: "all", ar: "كل الفئات العلاجية", en: "All therapeutic categories" },
  { value: "antibiotics", ar: "مضادات حيوية", en: "Antibiotics" },
  { value: "analgesics", ar: "مسكنات وخافضات حرارة", en: "Analgesics" },
  { value: "cardiovascular", ar: "القلب والأوعية", en: "Cardiovascular" },
  { value: "respiratory", ar: "الجهاز التنفسي", en: "Respiratory" },
  { value: "gastrointestinal", ar: "الجهاز الهضمي", en: "Gastrointestinal" },
  { value: "neurological", ar: "الجهاز العصبي", en: "Neurological" },
  { value: "endocrine", ar: "الغدد والهرمونات", en: "Endocrine" },
  { value: "antifungal", ar: "مضادات فطرية", en: "Antifungal" },
  { value: "antiviral", ar: "مضادات فيروسية", en: "Antiviral" },
  { value: "oncology", ar: "الأورام والمناعة", en: "Oncology & immunology" },
  { value: "dermatological", ar: "الأمراض الجلدية", en: "Dermatological" },
  { value: "ophthalmological", ar: "طب العيون", en: "Ophthalmological" },
  { value: "vitamins", ar: "فيتامينات ومعادن", en: "Vitamins & minerals" },
  { value: "other", ar: "فئات أخرى", en: "Other categories" },
] as const;

export function therapeuticCategoryLabel(category: string, language: "ar" | "en") {
  const match = therapeuticCategories.find((item) => item.value === category);
  return match ? match[language] : category;
}
