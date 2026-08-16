export type MedicineEntryPayload =
  | { isFreeText: false; drugId: number; freeTextName?: undefined }
  | { isFreeText: true; drugId?: undefined; freeTextName: string };

/** Converts one medicine-name input into either an explicit catalog selection or preserved free text. */
export function buildMedicineEntryPayload(input: string, selectedDrugId: string): MedicineEntryPayload | null {
  const typedName = input.trim();
  if (!typedName) return null;

  const drugId = Number(selectedDrugId);
  if (Number.isInteger(drugId) && drugId > 0) {
    return { isFreeText: false, drugId };
  }
  return { isFreeText: true, freeTextName: typedName };
}
