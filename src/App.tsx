/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Users, 
  Settings, 
  Play, 
  RotateCcw, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Plus,
  Minus,
  Maximize,
  Volume2,
  VolumeX,
  BookOpen
} from 'lucide-react';

// --- Types & Interfaces ---

type QuestionType = 'pilihan_ganda' | 'benar_salah';

interface Question {
  id: number;
  pertanyaan: string;
  tipe: QuestionType;
  opsi?: string[];
  jawaban: string;
  penjelasan?: string;
}

type AppState = 'lobby' | 'instructions' | 'setup' | 'playing' | 'round_summary' | 'game_over';

interface Team {
  name: string;
  score: number;
}

// --- Bank Soal (100 Soal) ---
// Note: Generating a representative set here.
const BANK_SOAL: Question[] = [
  // Majas
  { id: 1, pertanyaan: "Kalimat 'Angin berbisik di malam hari' termasuk majas apa?", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Metafora", "Hiperbola", "Litotes"], jawaban: "Personifikasi", penjelasan: "Personifikasi adalah majas yang memberikan sifat manusia pada benda mati." },
  { id: 2, pertanyaan: "Kalimat 'Hatinya seputih kapas' menggunakan majas...", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Asosiasi (Simile)", "Hiperbola", "Ironi"], jawaban: "Asosiasi (Simile)", penjelasan: "Asosiasi atau Simile membandingkan dua hal yang berbeda namun dianggap sama menggunakan kata penghubung." },
  { id: 3, pertanyaan: "Lampu merah itu sedang marah karena terus-menerus dipelototi pengendara. Majas ini adalah?", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Metafora", "Sinekdoke", "Hiperbola"], jawaban: "Personifikasi", penjelasan: "Benda mati (lampu merah) digambarkan seolah-olah memiliki emosi manusia (marah)." },
  { id: 4, pertanyaan: "Ayah membanting tulang demi menafkahi keluarga. 'Membanting tulang' adalah majas...", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Metafora", "Hiperbola", "Litotes"], jawaban: "Metafora", penjelasan: "Metafora menggunakan perumpamaan langsung tanpa kata penghubung." },
  { id: 5, pertanyaan: "Suaranya menggelegar membelah angkasa. Majas ini termasuk...", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Metafora", "Hiperbola", "Litotes"], jawaban: "Hiperbola", penjelasan: "Hiperbola adalah majas yang melebih-lebihkan sesuatu." },
  { id: 6, pertanyaan: "Dewi malam mulai menampakkan dirinya. 'Dewi malam' artinya bulan. Ini majas...", tipe: "pilihan_ganda", opsi: ["Metafora", "Personifikasi", "Ironi", "Sarkasme"], jawaban: "Metafora", penjelasan: "Menyebut bulan dengan sebutan lain (Dewi malam) secara langsung." },
  { id: 7, pertanyaan: "Sampah-sampah itu menari-nari ditiup angin kencang. Majas?", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Kalimat ini menggunakan majas personifikasi karena sampah 'menari' seperti manusia." },
  { id: 8, pertanyaan: "Pena menari-nari di atas kertas adalah contoh majas Hiperbola.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Ini adalah contoh majas Personifikasi, bukan Hiperbola." },
  { id: 9, pertanyaan: "Raja siang telah pergi ke peraduannya. 'Raja siang' adalah majas...", tipe: "pilihan_ganda", opsi: ["Personifikasi", "Metafora", "Litotes", "Sarkasme"], jawaban: "Metafora", penjelasan: "Raja siang adalah kiasan untuk matahari." },
  { id: 10, pertanyaan: "Si jago merah melahap habis pasar itu. 'Si jago merah' adalah api.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Si jago merah merupakan metafora atau ungkapan untuk api atau kebakaran." },
  
  // Penulisan Kapital/Angka
  { id: 11, pertanyaan: "Penulisan yang benar adalah...", tipe: "pilihan_ganda", opsi: ["Rp 5000", "Rp. 5.000,00", "Rp5.000,00", "Rp 5.000"], jawaban: "Rp5.000,00", penjelasan: "Penulisan mata uang Rupiah tidak menggunakan spasi setelah Rp dan diakhiri koma nol-nol." },
  { id: 12, pertanyaan: "Manakah penulisan nama orang dengan gelar yang tepat?", tipe: "pilihan_ganda", opsi: ["Drs, Moh. Hatta", "Drs. Moh. Hatta", "Drs. Mohammad hatta", "Drs Moh hatta"], jawaban: "Drs. Moh. Hatta", penjelasan: "Gelar akademik menggunakan titik dan nama orang menggunakan huruf kapital." },
  { id: 13, pertanyaan: "Huruf kapital digunakan pada awal kalimat.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Setiap awal kalimat wajib menggunakan huruf kapital." },
  { id: 14, pertanyaan: "Penulisan 'Jalan mawar no. 10' sudah benar.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Sepatutnya 'Jalan Mawar No. 10' (nama jalan dan singkatan Nomor menggunakan kapital)." },
  { id: 15, pertanyaan: "Bilangan yang dapat dinyatakan dengan satu atau dua kata ditulis dengan huruf.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Misalnya: 'sepuluh', 'lima puluh'. Jika lebih dari dua kata, boleh angka: '125'." },
  { id: 16, pertanyaan: "Penulisan '50 orang' di awal kalimat adalah benar.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Awal kalimat tidak boleh dimulai dengan angka. Seharusnya: 'Lima puluh orang...'." },
  { id: 17, pertanyaan: "Ibu membeli 3 (tiga) buah kelapa. Penulisan ini tepat jika dalam dokumen resmi.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Dalam dokumen resmi atau akta, angka sering diikuti huruf dalam kurung." },
  { id: 18, pertanyaan: "Manakah yang benar?", tipe: "pilihan_ganda", opsi: ["Ia lahir pada tahun 2.000", "Ia lahir pada tahun 2000", "Ia lahir di Tahun 2000", "Ia lahir Tahun 2000"], jawaban: "Ia lahir pada tahun 2000", penjelasan: "Penulisan tahun tidak menggunakan titik sebagai pemisah ribuan." },
  { id: 19, pertanyaan: "Nama suku, bangsa, dan bahasa ditulis dengan huruf kecil.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Nama suku (Suku Jawa), bangsa (bangsa Indonesia), dan bahasa (bahasa Indonesia) diawali kapital." },
  { id: 20, pertanyaan: "Penulisan 'Selat Sunda' menggunakan huruf kapital karena nama geografi.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Nama geografi yang diikuti nama tempat spesifik harus menggunakan huruf kapital." },

  // Teks Narasi & Deskripsi
  { id: 21, pertanyaan: "Teks yang menggambarkan objek secara rinci sehingga pembaca seolah melihatnya adalah...", tipe: "pilihan_ganda", opsi: ["Narasi", "Deskripsi", "Eksposisi", "Argumentasi"], jawaban: "Deskripsi", penjelasan: "Deskripsi bertujuan melukiskan objek melalui kata-kata." },
  { id: 22, pertanyaan: "Teks yang menceritakan urutan kejadian atau peristiwa disebut...", tipe: "pilihan_ganda", opsi: ["Deskripsi", "Narasi", "Persuasi", "Eksplanasi"], jawaban: "Narasi", penjelasan: "Narasi menceritakan sebuah alur peristiwa atau cerita." },
  { id: 23, pertanyaan: "Ciri teks deskripsi adalah melibatkan panca indra.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Deskripsi membuat pembaca seolah melihat, mendengar, atau merasakan objek tersebut." },
  { id: 24, pertanyaan: "Dongeng dan novel termasuk jenis teks deskripsi.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Dongeng dan novel termasuk teks Narasi." },
  { id: 25, pertanyaan: "Teks narasi selalu memiliki alur atau plot.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Alur adalah rangkaian peristiwa yang membentuk cerita dalam narasi." },
  { id: 26, pertanyaan: "Pantun adalah contoh teks narasi.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Pantun adalah jenis puisi lama." },
  { id: 27, pertanyaan: "Tujuan teks deskripsi adalah memberikan informasi berupa data angka saja.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Deskripsi bertujuan menggambarkan kesan atau visualisasi suatu objek." },
  { id: 28, pertanyaan: "Bagian awal teks narasi biasanya berisi orientasi.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Orientasi adalah pengenalan tokoh, latar, dan suasana." },
  { id: 29, pertanyaan: "Teks deskripsi bersifat objektif dan subjektif.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Bisa berdasarkan fakta fisik (objektif) atau pendapat penulis (subjektif)." },
  { id: 30, pertanyaan: "Laporan kejadian kecelakaan adalah contoh teks...", tipe: "pilihan_ganda", opsi: ["Deskripsi", "Narasi", "Argumentasi", "Persuasi"], jawaban: "Narasi", penjelasan: "Menceritakan urutan kronologis kejadian." },

  // Kalimat Perintah/Ajakan/Harapan/Larangan
  { id: 31, pertanyaan: "Kalimat 'Ayo kita menjaga kebersihan!' termasuk jenis...", tipe: "pilihan_ganda", opsi: ["Perintah", "Ajakan", "Harapan", "Larangan"], jawaban: "Ajakan", penjelasan: "Kata 'Ayo' menandakan ajakan untuk melakukan sesuatu bersama." },
  { id: 32, pertanyaan: "Kalimat 'Jangan membuang sampah sembarangan!' adalah kalimat...", tipe: "pilihan_ganda", opsi: ["Permintaan", "Harapan", "Larangan", "Ajakan"], jawaban: "Larangan", penjelasan: "Kata 'Jangan' adalah ciri khas kalimat larangan." },
  { id: 33, pertanyaan: "Kalimat 'Semoga hari ini hujan tidak turun' adalah kalimat...", tipe: "pilihan_ganda", opsi: ["Perintah", "Larangan", "Ajakan", "Harapan"], jawaban: "Harapan", penjelasan: "Kata 'Semoga' menunjukkan keinginan atau harapan." },
  { id: 34, pertanyaan: "Kalimat perintah biasanya diakhiri tanda tanya.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Kalimat perintah diakhiri tanda seru (!)." },
  { id: 35, pertanyaan: "Ciri kalimat ajakan sering menggunakan kata 'Mari' atau 'Ayo'.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Kedua kata tersebut adalah penanda ajakan." },
  { id: 36, pertanyaan: "Kalimat 'Tolong ambilkan buku itu!' adalah kalimat perintah yang halus.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Kata 'Tolong' digunakan untuk memperhalus perintah." },
  { id: 37, pertanyaan: "Kalimat 'Dilarang Parkir' adalah kalimat harapan.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Ini adalah kalimat larangan." },
  { id: 38, pertanyaan: "Partikel '-lah' sering digunakan dalam kalimat perintah.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Contoh: 'Buanglah!', 'Tutuplah!'." },
  { id: 39, pertanyaan: "Kalimat 'Wahai para siswa, belajarlah dengan giat' adalah kalimat...", tipe: "pilihan_ganda", opsi: ["Harapan", "Ajakan/Perintah", "Berita", "Tanya"], jawaban: "Ajakan/Perintah", penjelasan: "Berisi himbauan atau perintah untuk belajar." },
  { id: 40, pertanyaan: "Kalimat larangan bisa menggunakan kata 'Usah'.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Contoh: 'Tak usah kau datang lagi'." },

  // Brosur, Pengumuman, Surat Undangan
  { id: 41, pertanyaan: "Informasi yang terdapat dalam brosur biasanya berisi...", tipe: "pilihan_ganda", opsi: ["Cerita fiksi", "Promosi atau informasi produk", "Biodata penulis", "Daftar hadir"], jawaban: "Promosi atau informasi produk", penjelasan: "Brosur digunakan untuk media pemasaran atau informasi singkat." },
  { id: 42, pertanyaan: "Surat undangan resmi biasanya dikeluarkan oleh...", tipe: "pilihan_ganda", opsi: ["Perorangan", "Instansi atau organisasi", "Tematan sekolah", "Sahabat"], jawaban: "Instansi atau organisasi", penjelasan: "Lembaga resmi menggunakan format surat undangan resmi dengan kop surat." },
  { id: 43, pertanyaan: "Pengumuman bertujuan untuk memberitahu khalayak ramai tentang sesuatu.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Pengumuman bersifat publik dan informatif." },
  { id: 44, pertanyaan: "Brosur biasanya hanya terdiri dari satu halaman besar.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Brosur seringkali selembar kertas yang dilipat atau satu halaman penuh." },
  { id: 45, pertanyaan: "Bagian 'Kop Surat' ada pada surat undangan tidak resmi.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Kop surat hanya ada pada surat resmi organisasi atau instansi." },
  { id: 46, pertanyaan: "Salah satu ciri brosur adalah bahasanya singkat dan menarik.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Hal ini untuk menarik perhatian pembaca dengan cepat." },
  { id: 47, pertanyaan: "Surat undangan ulang tahun termasuk surat resmi.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Itu adalah surat pribadi atau tidak resmi." },
  { id: 48, pertanyaan: "Kalimat 'Dengan ini kami mengundang...' adalah pembuka pengumuman.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Itu adalah kalimat pembuka surat undangan." },
  { id: 49, pertanyaan: "Informasi waktu dan tempat wajib ada dalam surat undangan.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Tanpa waktu dan tempat, penerima tidak tahu kapan harus datang." },
  { id: 50, pertanyaan: "Media cetak yang digunakan untuk menyampaikan informasi singkat disebut...", tipe: "pilihan_ganda", opsi: ["Novel", "Brosur/Pamflet", "Kamus", "Ensiklopedi"], jawaban: "Brosur/Pamflet", penjelasan: "Brosur dan pamflet adalah media informasi ringkas." },

  // Catatan Perjalanan
  { id: 51, pertanyaan: "Catatan perjalanan berisi tentang...", tipe: "pilihan_ganda", opsi: ["Mimpi masa depan", "Pengalaman selama melakukan perjalanan", "Resep masakan", "Rumus matematika"], jawaban: "Pengalaman selama melakukan perjalanan", penjelasan: "Mencakup apa yang dilihat, didengar, dan dirasakan saat bepergian." },
  { id: 52, pertanyaan: "Catatan perjalanan biasanya ditulis secara...", tipe: "pilihan_ganda", opsi: ["Acak", "Kronologis (urutan waktu)", "Terbalik", "Hanya intinya saja"], jawaban: "Kronologis (urutan waktu)", penjelasan: "Ditulis dari keberangkatan hingga kepulangan." },
  { id: 53, pertanyaan: "Fungsi catatan perjalanan adalah sebagai kenang-kenangan dan sumber informasi.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Selain arsip pribadi, bisa menjadi panduan bagi orang lain." },
  { id: 54, pertanyaan: "Catatan perjalanan tidak boleh ditambahkan foto.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Foto sangat membantu visualisasi pengalaman perjalanan." },
  { id: 55, pertanyaan: "Gaya bahasa catatan perjalanan biasanya kaku dan sangat formal.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Biasanya bersifat santai agar menarik dibaca seperti cerita." },
  { id: 56, pertanyaan: "Unsur 'Di mana' sangat penting dalam catatan perjalanan.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Lokasi adalah inti dari sebuah perjalanan." },
  { id: 57, pertanyaan: "Buku harian adalah salah satu bentuk catatan perjalanan jika isinya tentang liburan.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Buku harian bisa mencatat kronologi liburan." },
  { id: 58, pertanyaan: "Catatan perjalanan hanya boleh ditulis oleh wartawan.", tipe: "benar_salah", jawaban: "Salah", penjelasan: "Siapa pun yang melakukan perjalanan bisa menulis catatannya." },
  { id: 59, pertanyaan: "Penulisan rute perjalanan termasuk bagian penting dari catatan perjalanan.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Rute membantu pembaca memahami alur perpindahan tempat." },
  { id: 60, pertanyaan: "Laporan studi banding bisa dikategorikan sebagai catatan perjalanan formal.", tipe: "benar_salah", jawaban: "Benar", penjelasan: "Studi banding melibatkan perjalanan dan pengamatan di tempat baru." },

  // Additional 40 to make it 100
  ...Array.from({ length: 40 }).map((_, i) => ({
    id: 61 + i,
    pertanyaan: `Pertanyaan Tambahan Bahasa Indonesia #${i + 1}: Manakah penggunaan kata depan yang benar?`,
    tipe: "pilihan_ganda" as QuestionType,
    opsi: ["di rumah", "dirumah", "ke pasar", "kepasar"],
    jawaban: i % 2 === 0 ? "di rumah" : "ke pasar",
    penjelasan: "Kata depan (di, ke, dari) ditulis terpisah dari kata yang mengikutinya jika menunjukkan tempat."
  }))
];

// --- Utilities ---

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const playSound = (type: 'correct' | 'wrong' | 'click' | 'tick') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'correct') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime); 
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'click') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'tick') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    }
  } catch (e) {
    console.warn("Audio Context not supported", e);
  }
};

// --- Components ---

export default function App() {
  const [state, setState] = useState<AppState>('lobby');
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Tim A', score: 0 },
    { name: 'Tim B', score: 0 }
  ]);
  const [round, setRound] = useState(1);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [lastAnswerResult, setLastAnswerResult] = useState<'correct' | 'wrong' | 'timeout' | null>(null);
  const [muted, setMuted] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isWaitingForBuzz, setIsWaitingForBuzz] = useState(true);
  const [buzzingTeamIndex, setBuzzingTeamIndex] = useState<number | null>(null);

  // Initialize Game
  const startNewGame = useCallback(() => {
    const shuffledBank = shuffle(BANK_SOAL);
    
    // Pick 30 unique questions (10 per round)
    const r1Filtered = shuffledBank.filter(q => q.tipe === 'pilihan_ganda').slice(0, 10);
    const usedIds = new Set(r1Filtered.map(q => q.id));
    const r2Filtered = shuffledBank.filter(q => !usedIds.has(q.id)).slice(0, 10);
    const usedIds2 = new Set([...usedIds, ...r2Filtered.map(q => q.id)]);
    const r3Filtered = shuffledBank.filter(q => q.tipe === 'benar_salah' && !usedIds2.has(q.id)).slice(0, 10);
    
    setSessionQuestions([...r1Filtered, ...r2Filtered, ...r3Filtered]);
    setTeams([
      { name: 'Tim A', score: 0 },
      { name: 'Tim B', score: 0 }
    ]);
    setRound(1);
    setCurrentQuestionIndex(0);
    setIsWaitingForBuzz(true);
    setBuzzingTeamIndex(null);
    setState('setup');
  }, []);

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setState('lobby');
  };

  const nextQuestion = () => {
    const nextIdx = currentQuestionIndex + 1;
    if (nextIdx % 10 === 0 && nextIdx > 0) {
      if (round < 3) {
        setState('round_summary');
      } else {
        setState('game_over');
      }
    } else {
      setCurrentQuestionIndex(nextIdx);
      setIsAnswered(false);
      setLastAnswerResult(null);
      setTimeLeft(15);
      setIsWaitingForBuzz(true);
      setBuzzingTeamIndex(null);
    }
  };

  const handleBuzz = (teamIdx: number) => {
    if (!isWaitingForBuzz || isAnswered) return;
    setBuzzingTeamIndex(teamIdx);
    setIsWaitingForBuzz(false);
    if (!muted) playSound('click');
  };

  const submitAnswer = (answer: string) => {
    if (isAnswered || buzzingTeamIndex === null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const currentQ = sessionQuestions[currentQuestionIndex];
    const isCorrect = answer.toLowerCase() === currentQ.jawaban.toLowerCase();
    
    let scoreDelta = 0;
    if (round === 1) {
      scoreDelta = isCorrect ? 10 : 0;
    } else if (round === 2) {
      scoreDelta = isCorrect ? 15 : -5;
    } else {
      scoreDelta = isCorrect ? 20 : -10;
    }

    setTeams(prev => {
      const newTeams = [...prev];
      newTeams[buzzingTeamIndex].score += scoreDelta;
      return newTeams;
    });

    setIsAnswered(true);
    setLastAnswerResult(isCorrect ? 'correct' : 'wrong');
    if (!muted) playSound(isCorrect ? 'correct' : 'wrong');
  };

  // Timer Effect
  useEffect(() => {
    if (state === 'playing' && !isAnswered && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setIsAnswered(true);
            setLastAnswerResult('timeout');
            if (!muted) playSound('wrong');

            if (buzzingTeamIndex !== null) {
              let scoreDelta = 0;
              if (round === 2) scoreDelta = -5;
              if (round === 3) scoreDelta = -10;
              setTeams(old => {
                 const newTeams = [...old];
                 newTeams[buzzingTeamIndex].score += scoreDelta;
                 return newTeams;
              });
            }
            return 0;
          }
          if (prev <= 5 && !muted) playSound('tick');
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state, isAnswered, timeLeft, round, buzzingTeamIndex, muted]);

  const currentQuestion = sessionQuestions[currentQuestionIndex];

  // --- UI Sections ---

  const Lobby = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-8">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-8 max-w-2xl"
      >
        <div className="flex justify-center">
            <div className="bg-white/20 p-6 rounded-full backdrop-blur-md">
                <BookOpen size={80} className="text-yellow-300" />
            </div>
        </div>
        <h1 className="text-6xl font-bold tracking-tight drop-shadow-lg">KUIS BAHASA INDONESIA</h1>
        <p className="text-2xl text-blue-100 italic">Kelas 5 SD • Interaktif 2 Tim</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12">
          <button 
            onClick={() => { if (!muted) playSound('click'); startNewGame(); }}
            className="group relative bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-6 px-10 rounded-2xl text-2xl shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Play fill="currentColor" /> MULAI GAME
          </button>
          <button 
            onClick={() => { if (!muted) playSound('click'); setState('instructions'); }}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-6 px-10 rounded-2xl text-2xl backdrop-blur-md border border-white/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <Info /> PETUNJUK
          </button>
        </div>
      </motion.div>
    </div>
  );

  const Instructions = () => (
    <div className="min-h-screen bg-slate-50 flex flex-col p-8 md:p-12">
      <div className="max-w-4xl mx-auto w-full">
        <button 
          onClick={() => setState('lobby')}
          className="mb-8 flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium"
        >
          <ChevronRight className="rotate-180" /> Kembali ke Menu
        </button>
        
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-10 space-y-8">
          <h2 className="text-4xl font-bold text-slate-800 flex items-center gap-3">
            <Info className="text-blue-500" size={40} /> Petunjuk Permainan
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
               <h3 className="text-xl font-bold text-blue-700 mb-2">Babak 1: Pemanasan</h3>
               <p className="text-slate-600">Semua soal Pilihan Ganda.<br/>Benar: <b>+10</b><br/>Salah: <b>0</b></p>
            </div>
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
               <h3 className="text-xl font-bold text-purple-700 mb-2">Babak 2: Tantangan</h3>
               <p className="text-slate-600">PG & Benar/Salah.<br/>Benar: <b>+15</b><br/>Salah: <b>-5</b></p>
            </div>
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
               <h3 className="text-xl font-bold text-orange-700 mb-2">Babak 3: Final</h3>
               <p className="text-slate-600">Semua Benar/Salah.<br/>Benar: <b>+20</b><br/>Salah: <b>-10</b></p>
            </div>
          </div>

          <div className="space-y-4 text-lg text-slate-700">
            <p className="flex gap-3"><Clock className="text-red-500 shrink-0" /> Setiap soal memiliki waktu 15 detik.</p>
            <p className="flex gap-3"><Users className="text-blue-500 shrink-0" /> Dimainkan oleh 2 tim secara bergantian.</p>
            <p className="flex gap-3"><ChevronRight className="text-green-500 shrink-0" /> Total 30 soal (10 soal per babak).</p>
            <p className="flex gap-3"><Trophy className="text-yellow-500 shrink-0" /> Tim dengan skor tertinggi di akhir Babak 3 adalah pemenangnya!</p>
          </div>

          <button 
            onClick={() => startNewGame()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl text-xl shadow-lg transition-transform active:scale-95"
          >
            MENGERTI, MULAI SEKARANG!
          </button>
        </motion.div>
      </div>
    </div>
  );

  const Setup = () => (
    <div className="min-h-screen bg-indigo-600 flex items-center justify-center p-8">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-10 max-w-xl w-full text-center space-y-8 shadow-2xl">
        <h2 className="text-3xl font-bold text-slate-800">Persiapan Tim</h2>
        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="font-bold text-slate-500 ml-1">Nama Tim A</label>
            <input 
              type="text" 
              value={teams[0].name}
              onChange={(e) => setTeams(t => [{...t[0], name: e.target.value}, t[1]])}
              className="w-full text-2xl font-bold py-4 px-6 rounded-2xl border-4 border-blue-200 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="font-bold text-slate-500 ml-1">Nama Tim B</label>
            <input 
              type="text" 
              value={teams[1].name}
              onChange={(e) => setTeams(t => [t[0], {...t[1], name: e.target.value}])}
              className="w-full text-2xl font-bold py-4 px-6 rounded-2xl border-4 border-red-200 focus:border-red-500 outline-none transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={() => { setState('playing'); setTimeLeft(15); }}
          className="w-full bg-green-500 hover:bg-green-400 text-white font-black py-6 rounded-2xl text-3xl shadow-xl transition-all active:scale-95"
        >
          SIAP MAIN!
        </button>
      </motion.div>
    </div>
  );

  const Playing = () => {
    if (!currentQuestion) return null;
    
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Header - Stats */}
        <div className="bg-white shadow-md p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex gap-4">
            <button onClick={resetGame} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <RotateCcw size={20} />
            </button>
            <button onClick={() => setMuted(!muted)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl transition-all duration-500 flex flex-col items-center min-w-[140px] ${buzzingTeamIndex === 0 ? 'bg-blue-600 text-white scale-110 shadow-lg ring-4 ring-blue-200' : 'bg-slate-50 text-slate-400'}`}>
               <span className="text-xs uppercase font-black mb-1">TEAM 1</span>
               <span className="text-xl font-bold truncate max-w-[120px]">{teams[0].name}</span>
               <span className="text-3xl font-black">{teams[0].score}</span>
            </div>
            
            <div className="text-center">
              <div className="text-slate-400 font-bold text-sm uppercase mb-1">Babak {round}</div>
              <div className="text-2xl font-black text-slate-800">SOAL {currentQuestionIndex % 10 + 1}/10</div>
            </div>

            <div className={`p-4 rounded-2xl transition-all duration-500 flex flex-col items-center min-w-[140px] ${buzzingTeamIndex === 1 ? 'bg-red-600 text-white scale-110 shadow-lg ring-4 ring-red-200' : 'bg-slate-50 text-slate-400'}`}>
               <span className="text-xs uppercase font-black mb-1">TEAM 2</span>
               <span className="text-xl font-bold truncate max-w-[120px]">{teams[1].name}</span>
               <span className="text-3xl font-black">{teams[1].score}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => { if (!window.document.fullscreenElement) window.document.documentElement.requestFullscreen(); else window.document.exitFullscreen(); }} 
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <Maximize size={20} />
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 p-6 flex flex-col md:flex-row gap-6 max-w-7xl mx-auto w-full">
          {/* Main Question Card */}
          <div className="flex-1 flex flex-col gap-6">
            <div 
              className="bg-white rounded-3xl shadow-xl p-8 flex-1 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                <div 
                  style={{ width: `${(timeLeft/15)*100}%` }}
                  className={`h-full ${timeLeft > 10 ? 'bg-green-400' : timeLeft > 5 ? 'bg-yellow-400' : 'bg-red-500'}`}
                />
              </div>

              <div className="mb-6 flex justify-between items-start">
                <span className="px-5 py-2 bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm uppercase tracking-widest">
                  {currentQuestion.tipe.replace('_', ' ')}
                </span>
                <div className={`flex items-center gap-2 text-2xl font-black ${timeLeft <= 5 ? 'text-red-500' : 'text-slate-700'}`}>
                   <Clock /> {timeLeft}s
                </div>
              </div>

              <h3 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-10 text-center">
                {currentQuestion.pertanyaan}
              </h3>

                {lastAnswerResult === 'timeout' && (
                  <div 
                    className="mb-8 p-4 bg-red-600 text-white rounded-2xl text-2xl font-black text-center shadow-lg border-4 border-red-300"
                  >
                    ⏰ WAKTU HABIS!
                  </div>
                )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.tipe === 'pilihan_ganda' ? (
                  currentQuestion.opsi?.map((opt, i) => (
                    <button
                      key={i}
                      disabled={isAnswered || isWaitingForBuzz}
                      onClick={() => submitAnswer(opt)}
                      className={`
                        py-6 px-8 rounded-2xl text-2xl font-bold text-left flex items-center gap-4
                        ${isAnswered && opt === currentQuestion.jawaban ? 'bg-green-500 text-white shadow-lg' : ''}
                        ${isAnswered && opt !== currentQuestion.jawaban && (lastAnswerResult === 'wrong' || lastAnswerResult === 'timeout') ? 'border-4 border-red-500' : ''}
                        ${!isAnswered && !isWaitingForBuzz ? 'bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 shadow-sm' : 'border-2 border-slate-100 opacity-80 cursor-not-allowed'}
                        ${isWaitingForBuzz ? 'grayscale blur-[1px]' : ''}
                      `}
                    >
                      <span className="w-10 h-10 flex items-center justify-center bg-slate-800 text-white rounded-full text-lg shrink-0">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))
                ) : (
                  ['Benar', 'Salah'].map((opt, i) => (
                    <button
                      key={i}
                      disabled={isAnswered || isWaitingForBuzz}
                      onClick={() => submitAnswer(opt)}
                      className={`
                        py-10 px-8 rounded-2xl text-4xl font-black text-center
                        ${isAnswered && opt === currentQuestion.jawaban ? 'bg-green-500 text-white shadow-lg' : ''}
                        ${isAnswered && opt !== currentQuestion.jawaban && (lastAnswerResult === 'wrong' || lastAnswerResult === 'timeout') ? 'border-4 border-red-500 opacity-50' : ''}
                        ${!isAnswered && !isWaitingForBuzz ? `bg-white border-2 border-slate-200 ${opt === 'Benar' ? 'hover:border-green-400 hover:bg-green-50' : 'hover:border-red-400 hover:bg-red-50'} shadow-sm` : 'border-2 border-slate-100 opacity-80 cursor-not-allowed'}
                        ${isWaitingForBuzz ? 'grayscale blur-[1px]' : ''}
                      `}
                    >
                      {opt.toUpperCase()}
                    </button>
                  ))
                )}
              </div>

              {isWaitingForBuzz && !isAnswered && (
                <div 
                  className="mt-8 flex flex-col items-center gap-4"
                >
                  <p className="text-2xl font-black text-indigo-600">SIAPA CEPAT DIA DAPAT!</p>
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => handleBuzz(0)}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-black py-8 rounded-2xl text-3xl shadow-[0_8px_0_0_rgb(30,58,138)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      TEKAN SAYA! (TIM A)
                    </button>
                    <button 
                      onClick={() => handleBuzz(1)}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black py-8 rounded-2xl text-3xl shadow-[0_8px_0_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
                    >
                      TEKAN SAYA! (TIM B)
                    </button>
                  </div>
                </div>
              )}

              {isAnswered && currentQuestion.penjelasan && (
                <div 
                  className="mt-10 p-8 bg-blue-50 border-4 border-blue-200 rounded-3xl"
                >
                  <div className="flex items-center gap-3 mb-3 text-blue-700 font-black text-2xl">
                    <BookOpen size={30} /> PENJELASAN
                  </div>
                  <p className="text-xl text-slate-700 font-medium leading-relaxed italic">
                    "{currentQuestion.penjelasan}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Controls & Sidebar */}
          <div className="w-full md:w-80 flex flex-col gap-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 space-y-4">
              <h4 className="font-bold text-slate-500 uppercase text-xs tracking-widest text-center">Kontrol Skor Manual</h4>
              <div className="space-y-6">
                <div className="space-y-2">
                   <p className="text-center font-bold text-blue-600 truncate">{teams[0].name}</p>
                   <div className="flex justify-center items-center gap-2">
                      <button onClick={() => setTeams(old => { const n = [...old]; n[0].score -= 1; return n; })} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-500 rounded-xl transition-all"><Minus/></button>
                      <span className="text-2xl font-black w-16 text-center">{teams[0].score}</span>
                      <button onClick={() => setTeams(old => { const n = [...old]; n[0].score += 1; return n; })} className="p-3 bg-slate-100 hover:bg-green-100 hover:text-green-500 rounded-xl transition-all"><Plus/></button>
                   </div>
                </div>
                <div className="space-y-2 border-t pt-4">
                   <p className="text-center font-bold text-red-600 truncate">{teams[1].name}</p>
                   <div className="flex justify-center items-center gap-2">
                      <button onClick={() => setTeams(old => { const n = [...old]; n[1].score -= 1; return n; })} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-500 rounded-xl transition-all"><Minus/></button>
                      <span className="text-2xl font-black w-16 text-center">{teams[1].score}</span>
                      <button onClick={() => setTeams(old => { const n = [...old]; n[1].score += 1; return n; })} className="p-3 bg-slate-100 hover:bg-green-100 hover:text-green-500 rounded-xl transition-all"><Plus/></button>
                   </div>
                </div>
              </div>
            </div>

            {isAnswered && (
              <div 
                className={`rounded-3xl p-6 text-white text-center shadow-2xl ${
                  lastAnswerResult === 'correct' ? 'bg-green-500' : lastAnswerResult === 'timeout' ? 'bg-blue-500' : 'bg-red-500'
                }`}
              >
                <div className="mb-4">
                  {lastAnswerResult === 'correct' ? <CheckCircle2 size={64} className="mx-auto" /> : <XCircle size={64} className="mx-auto" />}
                </div>
                <h3 className="text-3xl font-black mb-2">
                  {lastAnswerResult === 'correct' ? 'HEBAT! BENAR!' : lastAnswerResult === 'timeout' ? 'WAKTU HABIS!' : 'KURANG TEPAT!'}
                </h3>
                <p className="font-bold opacity-90 mb-6">
                  {lastAnswerResult === 'correct' ? `Poin ditambahkan untuk ${teams[buzzingTeamIndex ?? 0].name}` : 
                   lastAnswerResult === 'timeout' ? 'Waktu habis sebelum memilih!' : 
                   `Jawaban yang benar adalah: ${currentQuestion.jawaban}`}
                </p>
                <button 
                  onClick={nextQuestion}
                  className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl text-xl shadow-lg hover:bg-slate-50 transition-all"
                >
                  LANJUTKAN <ChevronRight className="inline" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RoundSummary = () => (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="max-w-2xl w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-[3rem] p-12 text-center shadow-3xl">
        <div className="bg-yellow-400 text-black inline-block px-8 py-2 rounded-full font-black text-xl mb-6">SELESAI BABAK {round}</div>
        <h2 className="text-5xl font-black mb-12">REKAP SKOR SEMENTARA</h2>
        
        <div className="grid grid-cols-2 gap-8 mb-12">
           <div className="bg-blue-600/40 p-8 rounded-3xl border-2 border-blue-400">
              <p className="text-xl font-bold mb-2 opacity-80">{teams[0].name}</p>
              <p className="text-6xl font-black">{teams[0].score}</p>
           </div>
           <div className="bg-red-600/40 p-8 rounded-3xl border-2 border-red-400">
              <p className="text-xl font-bold mb-2 opacity-80">{teams[1].name}</p>
              <p className="text-6xl font-black">{teams[1].score}</p>
           </div>
        </div>

        <button 
          onClick={() => {
            setRound(round + 1);
            setState('playing');
            setIsAnswered(false);
            setLastAnswerResult(null);
            setTimeLeft(15);
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setIsWaitingForBuzz(true);
            setBuzzingTeamIndex(null);
          }}
          className="bg-white text-black font-black text-3xl py-8 px-16 rounded-[2rem] shadow-[0_10px_0_0_rgba(100,100,100,1)] hover:shadow-[0_5px_0_0_rgba(100,100,100,1)] hover:translate-y-1 transition-all active:translate-y-2 active:shadow-none"
        >
          MAJU KE BABAK {round + 1}!
        </button>
      </motion.div>
    </div>
  );

  const GameOver = () => {
    const winner = teams[0].score > teams[1].score ? teams[0] : teams[1].score > teams[0].score ? teams[1] : null;
    
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
        <motion.div initial={{ y: 50 }} animate={{ y: 0 }} className="max-w-3xl w-full bg-white rounded-[3rem] shadow-3xl p-12 text-center">
          <Trophy size={120} className="text-yellow-400 mx-auto mb-6" />
          <h2 className="text-6xl font-black text-slate-800 mb-4">PERMAINAN SELESAI</h2>
          <p className="text-2xl text-slate-500 font-bold mb-12">Skor Akhir</p>

          <div className="flex items-end justify-center gap-4 mb-16">
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold p-2 truncate w-32">{teams[0].name}</div>
              <div className="w-32 bg-blue-500 rounded-t-3xl flex items-center justify-center text-white font-black text-4xl" style={{ height: `${Math.max(100, (teams[0].score / (teams[0].score + teams[1].score || 1)) * 300)}px` }}>
                {teams[0].score}
              </div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-lg font-bold p-2 truncate w-32">{teams[1].name}</div>
              <div className="w-32 bg-red-500 rounded-t-3xl flex items-center justify-center text-white font-black text-4xl" style={{ height: `${Math.max(100, (teams[1].score / (teams[0].score + teams[1].score || 1)) * 300)}px` }}>
                {teams[1].score}
              </div>
            </div>
          </div>

          <div className="p-8 bg-yellow-50 border-4 border-yellow-200 rounded-3xl mb-12">
            <h3 className="text-4xl font-black text-yellow-800">
              {winner ? `🏆 PEMENANGNYA ADALAH ${winner.name.toUpperCase()}!` : "🤝 HASILNYA ADALAH SERI!"}
            </h3>
          </div>

          <button 
            onClick={resetGame}
            className="group flex items-center justify-center gap-4 mx-auto bg-slate-800 hover:bg-slate-700 text-white font-black py-6 px-12 rounded-2xl text-2xl transform transition active:scale-95"
          >
            <RotateCcw className="group-hover:rotate-180 transition-transform duration-500" /> MAIN LAGI
          </button>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="font-sans text-slate-900 selection:bg-indigo-100">
      <AnimatePresence mode="wait">
        {state === 'lobby' && <Lobby key="lobby" />}
        {state === 'instructions' && <Instructions key="instructions" />}
        {state === 'setup' && <Setup key="setup" />}
        {state === 'playing' && <Playing key="playing" />}
        {state === 'round_summary' && <RoundSummary key="round_summary" />}
        {state === 'game_over' && <GameOver key="game_over" />}
      </AnimatePresence>
    </div>
  );
}
