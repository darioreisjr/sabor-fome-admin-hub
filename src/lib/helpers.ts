// Slug helpers
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const unitOptions = ["un", "fatia", "porcao", "combo", "50ml", "200ml", "300ml", "350ml", "400ml", "500ml"];
