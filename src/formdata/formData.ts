// @/formdata/formData.ts

const FILE_FIELDS = [
  "profileImage",
  "crCopy",
  "vatCopy",
  "gstTinDocument",
] as const;

export function objectToFormData<T extends Record<string, any>>(
  form: T,
  fileFields: readonly string[] = FILE_FIELDS
): FormData {
  const fd = new FormData();

  for (const [key, value] of Object.entries(form)) {
    if (value === null || value === undefined || value === "") continue;

    if (fileFields.includes(key)) {
      if (value instanceof File) fd.append(key, value);
    } else {
      fd.append(key, String(value));
    }
  }

  return fd;
}