export type Testimonial = {
  name: string;
  role: string;
  text: string;
  initial: string;
  rating: 1 | 2 | 3 | 4 | 5;
  product?: string;
};

export const testimonials: Testimonial[] = [
  {
    name: 'Siti Rahayu',
    role: 'Pelanggan',
    initial: 'S',
    rating: 5,
    product: 'Bolen Keju',
    text: 'Bolen kejunya enak banget. Rasa kejunya terasa dan pastry-nya lembut. Pasti order lagi!',
  },
  {
    name: 'Andi Pratama',
    role: 'Pelanggan',
    initial: 'A',
    rating: 5,
    product: 'Bomboloni',
    text: 'Bomboloninya juara. Filling banyak tapi tidak bikin enek. Recommended!',
  },
  {
    name: 'Dewi Lestari',
    role: 'Pelanggan',
    initial: 'D',
    rating: 5,
    product: 'Roti Sobek',
    text: 'Pelayanannya ramah dan proses pesanannya cepat. Roti sobeknya juga lembut sekali.',
  },
];
