import { Rabbi } from '@/types';

export const rabbis: Rabbi[] = [
  {
    id: 'rabbi-kahlani',
    name: 'Rabbi Natan Kahlani',
    title: 'Rosh Beit Hamidrash',
    photo: '/images/rabbis/faces/rabbi-kahlani-portrait.png',
    email: 'Rabbikahlani@wearechazak.com',
    bio: `Born in London, Rabbi Kahlani lived in Jerusalem where he co-founded Kehilat Avriechim Har Nof for English-speaking families. With 17 years of studying in Yeshiva, he was a devoted student of R' Osher Arieli Shlita for 6 years in Gemara Shiur and remains a Chabura member of R' Osher's graduates. Rabbi Kahlani studied Sedarim Kodshim and Moed, earned Smicha from Rabbi Zalman Nechemia Goldberg Shlita, and studied under Rabbi Moshe Shapira ZT"L. He has given weekly shiurim in Mir and other yeshivot in Jerusalem.`,
    shiurim: ['Brachot בקיאות', 'Pesachim פרק א B\'Iyun', 'Gittin Perek 3', 'Nefesh HaChaim'],
    isRosh: true,
  },
  {
    id: 'rabbi-hecht',
    name: 'Rabbi Hecht',
    photo: '/images/rabbis/faces/rabbi-hecht.png',
    shiurim: ['Beitza', 'Gittin Perek 3'],
  },
  {
    id: 'rabbi-bazak',
    name: 'Rabbi Bazak',
    photo: '/images/rabbis/faces/rabbi-bazak.png',
    shiurim: ['Succah'],
  },
  {
    id: 'rabbi-hye',
    name: 'Rabbi Hye',
    photo: '/images/rabbis/faces/rabbi-hye.png',
    shiurim: ['Tefilat Hashachar'],
  },
  {
    id: 'rabbi-goldstien',
    name: 'Rabbi Goldstien',
    photo: '/images/rabbis/rabbi-goldstien.png',
    shiurim: ['Mishna Bruruah Dirshu'],
  },
];

export const statistics = [
  { value: '100+', label: 'People learn daily' },
  { value: '40,000+', label: 'Visitors annually' },
  { value: '50,000', label: 'Hours of learning per year' },
];
