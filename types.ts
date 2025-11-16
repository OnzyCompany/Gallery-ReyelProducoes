
export interface Image {
  id: number;
  url: string;
  title: string;
}

export interface Category {
  id: string;
  name: string;
  images?: Image[];
  subCategories?: Category[];
}
