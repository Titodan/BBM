import { Shiur } from '@/types';

export const shiurim: Shiur[] = [
  // Early Morning Chabura (2 Tracks)
  {
    id: 'chabura-track1-seder',
    title: 'Track 1: Early Morning Seder',
    titleHebrew: 'מסכת גיטין פרק ג׳',
    rabbi: 'Rabbi Kahlani & Rabbi Hecht',
    time: '6:15-7:15 AM',
  },
  {
    id: 'chabura-track2-seder',
    title: 'Track 2: Early Morning Seder',
    titleHebrew: 'מסכת גיטין פרק ג׳',
    rabbi: 'Rabbi Kahlani & Rabbi Hecht',
    time: '6:45-8:00 AM',
  },
  
  // Morning Shiurim
  {
    id: 'pesachim-biyun-morning',
    title: 'Pesachim',
    titleHebrew: 'מסכת פסחים פרק א׳ בעיון',
    rabbi: 'Rabbi Kahlani',
    time: '7:45 - 9:45 PM',
  },
  
  // Night Shiurim
  {
    id: 'brachot-bekiut-night',
    title: 'Brachot',
    titleHebrew: 'מסכת ברכות פרק ד׳ בקיאות',
    rabbi: 'Rabbi Kahlani',
    time: '7:45-9:45 PM',
  },
  {
    id: 'beitza-night',
    title: 'Beitza',
    titleHebrew: 'מסכת ביצה פרק ב׳ ',
    rabbi: 'Rabbi Hecht',
    time: '7:45-9:45 PM',
  },
  {
    id: 'succah-night',
    title: 'Succah',
    titleHebrew: 'מסכת סוכה פרק ב׳ בעיון',
    rabbi: 'Rabbi Bazak',
    time: '7:45-9:45 PM',
  },
  {
    id: 'tefilat-hashachar-night',
    title: 'Tefilat Hashachar',
    titleHebrew: 'מסכת ברכות פרק ד׳ ',
    rabbi: 'Rabbi Hye',
    time: '7:45-9:45 PM',
  },
  {
    id: 'mishna-bruruah',
    title: 'Mishna Bruruah Dirshu',
    rabbi: 'Rabbi Eli Goldstien',
    time: '10:15 PM',
  },
  
  // Special Weekly Shiurim
  {
    id: 'nefesh-hachaim',
    title: 'Nefesh HaChaim שנ"א',
    rabbi: 'Rabbi Kahlani',
    time: '9:00 PM',
    dayOfWeek: 'Tuesday',
    isSpecial: true,
  },
  {
    id: 'thursday-shmooze',
    title: 'Shmooze',
    rabbi: 'BBM',
    time: '9:25 PM',
    dayOfWeek: 'Thursday',
    isSpecial: true,
  },
  {
    id: 'late-night-chabura',
    title: "Late Night Chabura on Sefer Re'eh Emunah",
    titleHebrew: 'ספר ראה אמונה',
    rabbi: 'Rabbi Kahlani',
    time: '10:15 PM',
    dayOfWeek: 'Thursday',
    location: "@ Rabbi Kahlani's house",
    topic: 'Rabbi Moshe Shapira zt"l',
    isSpecial: true,
  },
];
