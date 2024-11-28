import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import './App.css';

const App = () => {
    const [text, setText] = useState('Pilih Weaponmu!');
    const [ptext, setpText] = useState('');
    const [winBGKStreaks, setWinBGK] = useState(() => parseInt(localStorage.getItem('winBGKStreaks')) || 0);
    const [loseBGKStreaks, setLoseBGK] = useState(() => parseInt(localStorage.getItem('loseBGKStreaks')) || 0);
    const [drawBGKStreaks, setDrawBGK] = useState(() => parseInt(localStorage.getItem('drawBGKStreaks')) || 0);
    const [isGameInProgress, setIsGameInProgress] = useState(false);
    const [history, setHistory] = useState([]);
    const [ChoosenOne, setChoosenOne] = useState(() => {
        const choices = ['Batu', 'Kertas', 'Gunting'];
        return choices[Math.floor(Math.random() * 3)];
    });

    const battle = (playerChoice, computerChoice) => {
        let result; 
        if (playerChoice === computerChoice) {
            result = 'Seri';
        }
        else if (
            (playerChoice === 'Batu' && computerChoice === 'Gunting') ||
            (playerChoice === 'Kertas' && computerChoice === 'Batu') ||
            (playerChoice === 'Gunting' && computerChoice === 'Kertas')
        ) {
            result = 'Menang';
        } else {
            result = 'Kalah';
        }

        axios.post('http://localhost:5000/api/saveResult', {
            playerChoice,
            computerChoice,
            result,
        })
        .then((response) => {
            console.log("Data sudah di save:", response.data);
        })
        .catch(error => {
            console.error('Terjadi kesalahan saat menyimpan hasil:', error);
        });
        return result
    };

    const handleButton = (buttonNumber) => {
        if (isGameInProgress) return; 
        setIsGameInProgress(true);

        let randomChoice = Math.floor(Math.random() * 3) + 1; 
        let choosen = '';
        if (randomChoice === 1) {
            choosen = 'Batu';
        } else if (randomChoice === 2) {
            choosen = 'Kertas';
        } else if (randomChoice === 3) {
            choosen = 'Gunting';
        }

        setChoosenOne(randomChoice);
    
        let result = battle(buttonNumber, choosen);
        if (result === 'Seri') {
            setText(`Seri! Kalian berdua memilih ${choosen}`);
            setpText("Memuat permainan selanjutnya...");
            const newDrawStreak = drawBGKStreaks + 1;
            setDrawBGK(newDrawStreak); 
            localStorage.setItem('drawBGKStreaks', newDrawStreak); 
        }
        else if (result === 'Menang') {
            setText("Kamu Menang!");
            setpText("Memuat permainan selanjutnya...");
            const newWinStreak = winBGKStreaks + 1;
            setWinBGK(newWinStreak); 
            localStorage.setItem('winBGKStreaks', newWinStreak); 
        } else {
            setText(`Kamu Kalah! Lawan memilih ${choosen}`);
            setpText("Memuat permainan selanjutnya...");
            const newLoseStreak = loseBGKStreaks + 1;
            setLoseBGK(newLoseStreak); 
            localStorage.setItem('loseBGKStreaks', newLoseStreak); 
        }
        
        axios.get('http://localhost:5000/api/history')
        .then(response => {
            setHistory(response.data); 
        })
        .catch(error => {
            console.error('Terjadi kesalahan saat mengambil riwayat:', error);
        });
        
        setTimeout(() => {
            handleRefresh();
            setIsGameInProgress(false);
        }, 3000);
    };    

    useEffect(() => {
        axios.get('http://localhost:5000/api/history')
        .then(response => {
            setHistory(response.data); 
        })
        .catch(error => {
            console.error('Terjadi kesalahan saat mengambil riwayat:', error);
        });
    }, []);

    const handleRefresh = () => {
        setText('Pilih senjatamu!');
        setpText('');
    };

    const handleResetScore = () => {
        if (isGameInProgress) return; 
        setIsGameInProgress(true);
    
        axios.post('http://localhost:5000/api/reset')
        .then((response) => {
            console.log("Database reset successfully:", response.data);
    
            //Memperbarui riwayat permainan setelah reset
            axios.get('http://localhost:5000/api/history')
            .then(response => {
                setHistory(response.data); 
            })
            .catch(error => {
                console.error('Terjadi kesalahan saat mengambil riwayat:', error);
            });
    
            handleRefresh();
        })
        .catch(error => {
            console.error('Error while resetting the database:', error);
        });
    
        setWinBGK(0);
        setLoseBGK(0); 
        setDrawBGK(0);
    
        localStorage.removeItem('winBGKStreaks'); 
        localStorage.removeItem('loseBGKStreaks'); 
        localStorage.removeItem('drawBGKStreaks');
    
        //Menyimpan nilai 0 untuk semua streak di localStorage setelah reset
        localStorage.setItem('winBGKStreaks', 0);
        localStorage.setItem('loseBGKStreaks', 0);
        localStorage.setItem('drawBGKStreaks', 0);
    
        setIsGameInProgress(false);    
    };
    

    return (
        <div className="text-center h-screen flex flex-col items-center m-10">
            <div className="flex flex-col items-center justify-center">
                <h1 className="text-[#F0EDCC] text-4xl md:text-5xl lg:text-6xl font-light mb-12">{text}</h1>
                <div className="flex flex-row items-center justify-center gap-5 md:gap-8 lg:gap-16 mt-4">
                    <button onClick={() => handleButton('Batu')} className="w-24 h-20 md:w-32 md:h-24 lg:w-48 lg:h-32 bg-[#F0EDCC] text-[#02343F] rounded-lg font-bold shadow-md active:shadow-sm active:translate-y-1 flex items-center justify-center">
                        Batu
                    </button>
                    <button onClick={() => handleButton('Kertas')} className="w-24 h-20 md:w-32 md:h-24 lg:w-48 lg:h-32  bg-[#F0EDCC] text-[#02343F] rounded-lg font-bold shadow-md active:shadow-sm active:translate-y-1 flex items-center justify-center">
                        Kertas
                    </button>
                    <button onClick={() => handleButton('Gunting')} className="w-24 h-20 md:w-32 md:h-24 lg:w-48 lg:h-32  bg-[#F0EDCC] text-[#02343F] rounded-lg font-bold shadow-md active:shadow-sm active:translate-y-1 flex items-center justify-center">
                        Gunting
                    </button>
                </div>
                <p className="text-[#F0EDCC] text-sm md:text-md lg:text-lg font-light mt-12 font-sans ">{ptext}</p>
            </div>
            <div className="flex flex-row items-center justify-center gap-2 lg:gap-16 mt-12">
                <div className="text-[#02343F] bg-[#F0EDCC] rounded-lg px-8 py-2 md:px-8 md:py-3 lg:px-16 lg:py-4 font-light font-sans">Menang: {winBGKStreaks}</div>
                <div className="text-[#02343F] bg-[#F0EDCC] rounded-lg px-8 py-2 md:px-8 md:py-3 lg:px-16 lg:py-4 font-light font-sans">Kalah: {loseBGKStreaks}</div>
                <div className="text-[#02343F] bg-[#F0EDCC] rounded-lg px-8 py-2 md:px-8 md:py-3 lg:px-16 lg:py-4 font-light font-sans">Seri: {drawBGKStreaks}</div>
            </div>
            <button onClick={handleResetScore} className="mt-6 md:mt-8 lg:mt-16 text-xl md:text-1xl lg:text-2xl px-8 py-2 md:py-3 lg:px-16 lg:px-16 lg:py-4 bg-[#F0EDCC] text-[#02343F] rounded-lg shadow-md mx-auto block font-light">
                Reset
            </button>
            <div className="history-container mt-6">
                <h3 className="text-[#F0EDCC] text-xl font-light">Riwayat Permainan:</h3>
                <ul className="text-[#F0EDCC]">
                    {history.map((game, index) => (
                        <li key={game.id} className="font-sans">
                            {`Permainan ${index + 1}: ${game.result} (Pemain: ${game.player_choice}, Lawan: ${game.computer_choice})`}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default App;
