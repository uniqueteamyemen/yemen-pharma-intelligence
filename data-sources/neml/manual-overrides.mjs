/**
 * Source-verified corrections for entries split across adjacent PDF text lines.
 * Keys match the initially extracted catalog key; values are transcribed only from
 * the supplied 2019 and 2022 NEML text, never inferred from external data.
 */
export const manualOverrides = {
  'abacavir|tablet|60 mg as': { genericName: 'Abacavir + Lamivudine', strength: '60mg + 30mg; 120mg + 60mg' },
  'amoxicillin|oral liquid|125 mg amoxicillin 31 25 mg': { genericName: 'Amoxicillin + Clavulanic Acid', strength: '125mg + 31.25mg/5mL; 250mg + 62.5mg/5mL' },
  'artemether|tablet|20 mg 120 mg': { genericName: 'Artemether + Lumefantrine', strength: '20mg + 120mg' },
  'atazanavir|tablet|300 mg 100': { genericName: 'Atazanavir + Ritonavir', strength: '300mg + 100mg' },
  'caffeine citrate|injection|20 mg ml equivalent to 10': { genericName: 'Caffeine Citrate', strength: '20mg/mL (equivalent to 10mg caffeine base/mL)' },
  'dexamethasone as disodium|injection|4 mg': { genericName: 'Dexamethasone (as disodium phosphate)', strength: '4mg' },
  'efavirenz|tablet|600 mg 200 mg 300 mg disoproxil': { genericName: 'Efavirenz + Emtricitabine + Tenofovir Disoproxil Fumarate', strength: '600mg + 200mg + 300mg' },
  'efavirenz|tablet|400 mg 300 mg 300 mg disoproxil': { genericName: 'Efavirenz + Lamivudine + Tenofovir Disoproxil Fumarate', strength: '400mg + 300mg + 300mg' },
  'embonate|oral liquid|50 mg ml': { genericName: 'Pyrantel (as embonate)', strength: '50mg/mL' },
  'ethambutol|tablet|275 mg 75 mg 400 mg 150 mg': { genericName: 'Ethambutol + Isoniazid + Pyrazinamide + Rifampicin', strength: '275mg + 75mg + 400mg + 150mg' },
  'ethambutol|tablet|275 mg 75 mg 150 mg': { genericName: 'Ethambutol + Isoniazid + Rifampicin', strength: '275mg + 75mg + 150mg' },
  'fentanyl|transdermal patch|50 micrograms hr 75': { genericName: 'Fentanyl', strength: '50, 75, 100 micrograms/hour' },
  'ferrous salt|tablet|equivalent to 60 mg iron 400': { genericName: 'Ferrous Salt + Folic Acid', strength: 'Equivalent to 60mg iron + 400 micrograms folic acid' },
  'hyclate|tablet|500 mg as': { genericName: 'Doxycycline', strength: '50mg; 100mg' },
  'glucose with|solution|4 glucose 0 18': { genericName: 'Glucose with Sodium Chloride', strength: '4% glucose, 0.18% sodium chloride' },
  'ipratropium|inhalation|20': { genericName: 'Ipratropium Bromide', strength: '20 micrograms/metered dose' },
  'isoniazid|tablet|50 mg 150 mg 75': { genericName: 'Isoniazid + Pyrazinamide + Rifampicin', strength: '50mg + 150mg + 75mg' },
  'isoniazid|tablet|75 mg 150 mg 150 mg 300 mg': { genericName: 'Isoniazid + Rifampicin', strength: '75mg + 150mg; 150mg + 300mg' },
  'isoniazid|tablet|300 mg 25 mg 800 mg': { genericName: 'Isoniazid + Pyridoxine + Sulfamethoxazole + Trimethoprim', strength: '300mg + 25mg + 800mg + 160mg' },
  'lactulose|oral liquid|3 1 3 7 g 5 ml 2': { genericName: 'Lactulose', strength: '3.1–3.7g/5mL' },
  'latanoprost|solution|latanoprost 50': { genericName: 'Latanoprost', strength: '50 micrograms/mL' },
  'ledipasvir|tablet|90 mg 400 mg': { genericName: 'Ledipasvir + Sofosbuvir', strength: '90mg + 400mg' },
  'lidocaine|dental cartridge|2': { genericName: 'Lidocaine + Epinephrine (Adrenaline)', strength: '2% + epinephrine 1:80,000' },
  'pyrantel as|tablet|250 mg': { genericName: 'Pyrantel (as embonate)', strength: '250mg' },
  'potassium|powder|for solution': { genericName: 'Potassium Chloride', dosageForm: 'Powder for solution', strength: null },
  'potassium|solution|11 2 in 20 ml ampoule': { genericName: 'Potassium Chloride', strength: '11.2% in 20mL ampoule' },
  'sofosbovir|tablet|400 mg 100 mg': { genericName: 'Sofosbuvir + Velpatasvir', strength: '400mg + 100mg' },
  'sofosbovir|tablet|400 mg 200 mg': { genericName: 'Sofosbuvir + Ribavirin', strength: '400mg + 200mg' },
  'sodium hydrogen|solution|1 4 isotonic': { genericName: 'Sodium Hydrogen Carbonate', strength: '1.4% isotonic' },
  'valproate|oral liquid|250 mg 5ml': { genericName: 'Valproic Acid (Sodium Valproate)', strength: '250mg/5mL' },
  'zole|ampoule|80 mg 16 mg ml in 10 ml': { genericName: 'Sulfamethoxazole + Trimethoprim', dosageForm: 'Injection', strength: '80mg + 16mg/mL' },
};
