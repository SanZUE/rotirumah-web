export type Product = {
  slug: string;
  name: string;
  category: 'Andalan' | 'Reguler' | 'Musiman';
  price: number;
  description: string;
  image: string;
  variants?: string[];
};

export const products: Product[] = [
  { slug:'bolen-keju', name:'Roti Bolen Keju', category:'Andalan', price:15000, description:'Bolen berlapis renyah dengan isian keju gurih yang lembut.', image:'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=82', variants:['Keju','Cokelat','Pisang','Durian'] },
  { slug:'bolen-cokelat', name:'Roti Bolen Cokelat', category:'Andalan', price:15000, description:'Lapisan pastry renyah dengan cokelat yang lumer.', image:'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?auto=format&fit=crop&w=1000&q=82', variants:['Cokelat','Keju'] },
  { slug:'bomboloni', name:'Donat Bomboloni', category:'Andalan', price:12000, description:'Donat empuk dengan filling melimpah di setiap gigitan.', image:'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1000&q=82', variants:['Cokelat','Vanila','Strawberry','Tiramisu'] },
  { slug:'roti-sobek', name:'Roti Sobek', category:'Andalan', price:18000, description:'Roti lembut untuk sarapan dan teman ngopi di rumah.', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=82', variants:['Original','Cokelat','Keju'] },
  { slug:'roti-keju', name:'Roti Keju', category:'Andalan', price:12000, description:'Roti lembut dengan taburan keju gurih.', image:'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=1000&q=82' },
  { slug:'roti-cokelat', name:'Roti Cokelat', category:'Reguler', price:10000, description:'Roti klasik dengan isian cokelat yang familiar dan nyaman.', image:'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1000&q=82' },
  { slug:'roti-sosis', name:'Roti Sosis', category:'Reguler', price:13000, description:'Roti gurih dengan sosis dan saus yang pas.', image:'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=82' },
  { slug:'bolen-durian', name:'Bolen Durian', category:'Musiman', price:16000, description:'Varian spesial dengan aroma dan rasa durian yang kuat.', image:'https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=1000&q=82', variants:['Durian Medan','Durian Premium'] },
  { slug:'paket-lebaran', name:'Paket Lebaran', category:'Musiman', price:120000, description:'Paket hampers keluarga untuk berbagi di momen spesial.', image:'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=82' },
];

export const bundles = [
  { name:'Paket Ngopi', price:45000, desc:'Roti sobek mini + 2 bolen + 2 bomboloni.', image:'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82' },
  { name:'Paket Hampers', price:120000, desc:'Pilihan roti dan bolen untuk hadiah keluarga.', image:'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=1200&q=82' },
  { name:'Paket Keluarga', price:85000, desc:'Campuran produk favorit untuk kumpul di rumah.', image:'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1200&q=82' },
  { name:'Paket Spesial', price:150000, desc:'Custom isi sesuai kebutuhan acara atau hadiah.', image:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=82' },
];

export const testimonials = [
  { name:'Siti Rahayu', role:'Pelanggan', text:'Bolen kejunya enak banget. Rasa kejunya terasa dan pastry-nya lembut. Pasti order lagi!', initial:'S' },
  { name:'Andi Pratama', role:'Pelanggan', text:'Bomboloninya juara. Filling banyak tapi tidak bikin enek. Recommended!', initial:'A' },
  { name:'Dewi Lestari', role:'Pelanggan', text:'Pelayanannya ramah dan proses pesanannya cepat. Roti sobeknya juga lembut sekali.', initial:'D' },
];

export const rupiah = (value:number) => new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value);
