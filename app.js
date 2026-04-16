// フレーズデータベース
const phrases = [
    { 
        name: "Take it easy", 
        category: "Sister Act ①",
        situation: "別れ際",
        example: "友達: 'See you tomorrow!' あなた: 'Take it easy!'"
    },
    { 
        name: "Get outta here", 
        category: "Sister Act ①",
        situation: "驚いた時",
        example: "友達: 'I got accepted to UofT!' あなた: 'Get outta here! Really??'"
    },
    { 
        name: "I'm outta here", 
        category: "Sister Act ①",
        situation: "帰る時",
        example: "あなた: 'Alright guys, I'm outta here. See you!'"
    },
    { 
        name: "It is what it is", 
        category: "日常会話 #1",
        situation: "仕方ない時",
        example: "友達: 'The weather sucks.' あなた: 'Yeah, it is what it is.'"
    }
];

// 今日のフレーズを表示
function showDailyPhrase() {
    const today = new Date().toDateString();
    let dailyPhraseIndex = localStorage.getItem('dailyPhraseDate');
    
    if (dailyPhraseIndex !== today) {
        const randomIndex = Math.floor(Math.random() * phrases.length);
        localStorage.setItem('dailyPhraseIndex', randomIndex);
        localStorage.setItem('dailyPhraseDate', today);
        dailyPhraseIndex = randomIndex;
    } else {
        dailyPhraseIndex = parseInt(localStorage.getItem('dailyPhraseIndex') || 0);
    }

    const phrase = phrases[dailyPhraseIndex];
    document.getElementById('dailyPhrase').innerHTML = 
        `"${phrase.name}"<br><small style="font-size: 0.5em; opacity: 0.8;">使う場面: ${phrase.situation}</small>`;
    
    // シミュレーションもこのフレーズに設定
    currentSimulationPhrase = phrase;
}

// フレーズを手動で更新
function refreshDailyPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];
    localStorage.setItem('dailyPhraseIndex', randomIndex);
    document.getElementById('dailyPhrase').innerHTML = 
        `"${phrase.name}"<br><small style="font-size: 0.5em; opacity: 0.8;">使う場面: ${phrase.situation}</small>`;
    currentSimulationPhrase = phrase;
    
    // タスクをリセット
    resetMissionTasks();
}

// ミッションタスクのトグル
function toggleMissionTask(element, taskId) {
    const checkbox = document.getElementById(taskId);
    checkbox.checked = !checkbox.checked;
    
    if (checkbox.checked) {
        element.classList.add('completed');
        // 完了音（オプション）
        playSuccessSound();
    } else {
        element.classList.remove('completed');
    }
    
    // LocalStorageに保存
    saveMissionProgress();
    checkMissionComplete();
}

// ミッション進捗を保存
function saveMissionProgress() {
    const today = new Date().toDateString();
    const progress = {
        task1: document.getElementById('task1').checked,
        task2: document.getElementById('task2').checked,
        task3: document.getElementById('task3').checked,
        date: today
    };
    localStorage.setItem('dailyMissionProgress', JSON.stringify(progress));
}

// ミッション完了チェック
function checkMissionComplete() {
    const allTasks = [
        document.getElementById('task1').checked,
        document.getElementById('task2').checked,
        document.getElementById('task3').checked
    ];
    
    if (allTasks.every(task => task === true)) {
        // 全部完了したら祝福
        showCelebration();
        updateStreak();
    }
}

// 祝福アニメーション
function showCelebration() {
    alert('🎉 今日のミッション完了！素晴らしい！\n明日も続けよう！');
    // ここに紙吹雪アニメーションなど追加可能
}

// 連続日数を更新
function updateStreak() {
    const today = new Date().toDateString();
    const lastCompleteDate = localStorage.getItem('lastCompleteDate');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();
    
    let streak = parseInt(localStorage.getItem('streak') || '0');
    
    if (lastCompleteDate === yesterdayStr) {
        // 連続している
        streak++;
    } else if (lastCompleteDate !== today) {
        // 途切れた
        streak = 1;
    }
    
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastCompleteDate', today);
    updateStats();
}

// タイマー関連
let timerInterval;
let timeLeft = 30;
let practiceCount = 0;

function startTimer() {
    clearInterval(timerInterval);
    timeLeft = 30;
    document.getElementById('timer').textContent = '00:30';
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const seconds = timeLeft.toString().padStart(2, '0');
        document.getElementById('timer').textContent = `00:${seconds}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert(`タイムアップ！\n${practiceCount}回 言えました！\n\n実際の会話でも使ってみよう！`);
        }
    }, 1000);
}

function incrementCount() {
    practiceCount++;
    document.getElementById('count').textContent = `${practiceCount}回`;
}

function resetPractice() {
    clearInterval(timerInterval);
    timeLeft = 30;
    practiceCount = 0;
    document.getElementById('timer').textContent = '00:30';
    document.getElementById('count').textContent = '0回';
}

// 成功音を再生（オプション）
function playSuccessSound() {
    // Web Audio API で簡単な音を鳴らす
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// カルーセルのスクロール
function scrollCarousel(carouselId, direction) {
    const carousel = document.getElementById(carouselId);
    const scrollAmount = 325; // カード幅 + gap
    carousel.scrollLeft += scrollAmount * direction;
}

// 統計を更新
function updateStats() {
    // 今週使ったフレーズ数（仮データ）
    const weeklyUsed = parseInt(localStorage.getItem('weeklyUsed') || '0');
    document.getElementById('weeklyUsed').textContent = weeklyUsed;
    
    // 連続日数
    const streak = parseInt(localStorage.getItem('streak') || '0');
    document.getElementById('streakDays').textContent = streak;
    
    // マスター数（仮データ）
    const mastered = parseInt(localStorage.getItem('masteredCount') || '0');
    document.getElementById('masteredCount').textContent = mastered;
    
    // 進捗バー
    const totalPhrases = phrases.length;
    const progress = Math.round((mastered / totalPhrases) * 100);
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressBar').textContent = progress + '%';
}

// ミッションタスクをリセット
function resetMissionTasks() {
    ['task1', 'task2', 'task3'].forEach(taskId => {
        const checkbox = document.getElementById(taskId);
        const element = checkbox.parentElement;
        checkbox.checked = false;
        element.classList.remove('completed');
    });
}

// 会話シミュレーション
let currentSimulationPhrase = null;
let currentScenario = null;

const scenarios = {
    "Take it easy": {
        setup: "友達と図書館で別れる時",
        messages: [
            { speaker: "friend", text: "Alright, I gotta go. See you tomorrow!" },
            { speaker: "you", text: "", choices: [
                { text: "Take it easy!", correct: true, feedback: "完璧！これが自然な使い方です！" },
                { text: "Goodbye!", correct: false, feedback: "間違いじゃないけど、'Take it easy'の方がカジュアルで自然！" },
                { text: "See you later.", correct: false, feedback: "これも良いけど、今日のフレーズを使ってみよう！" }
            ]}
        ]
    },
    "Get outta here": {
        setup: "友達が良いニュースを教えてくれた時",
        messages: [
            { speaker: "friend", text: "Guess what? I got accepted to UofT!" },
            { speaker: "you", text: "", choices: [
                { text: "Get outta here! Really?? That's amazing!", correct: true, feedback: "素晴らしい！驚きを完璧に表現できました！" },
                { text: "Congratulations!", correct: false, feedback: "もちろん良いけど、驚きを表すフレーズも使ってみよう！" },
                { text: "That's great news!", correct: false, feedback: "正解だけど、今日のフレーズを使うともっとネイティブっぽい！" }
            ]}
        ]
    },
    "I'm outta here": {
        setup: "授業が終わって帰る時",
        messages: [
            { speaker: "friend", text: "Class is over. What are you doing now?" },
            { speaker: "you", text: "", choices: [
                { text: "I'm outta here. See you tomorrow!", correct: true, feedback: "パーフェクト！とても自然です！" },
                { text: "I'm going home.", correct: false, feedback: "間違いじゃないけど、もっとカジュアルに言ってみよう！" },
                { text: "I have to leave.", correct: false, feedback: "堅いです。'I'm outta here'の方がカジュアル！" }
            ]}
        ]
    },
    "It is what it is": {
        setup: "バスが遅れている時",
        messages: [
            { speaker: "friend", text: "Ugh, the TTC is late again..." },
            { speaker: "you", text: "", choices: [
                { text: "It is what it is. This is Toronto transit!", correct: true, feedback: "完璧！諦観と受け入れを上手に表現！" },
                { text: "That's unfortunate.", correct: false, feedback: "フォーマルすぎ。もっとカジュアルに！" },
                { text: "I hate when this happens.", correct: false, feedback: "気持ちは分かるけど、受け入れる態度を見せよう！" }
            ]}
        ]
    }
};

function startSimulation() {
    if (!currentSimulationPhrase) {
        currentSimulationPhrase = phrases[0];
    }
    
    const scenario = scenarios[currentSimulationPhrase.name];
    if (!scenario) {
        alert('このフレーズのシミュレーションは準備中です！');
        return;
    }
    
    currentScenario = scenario;
    
    const conversationDiv = document.getElementById('conversation');
    conversationDiv.innerHTML = `
        <div style="background: #667eea; color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center;">
            <strong>シーン：${scenario.setup}</strong>
        </div>
        <div class="message them">${scenario.messages[0].text}</div>
        <div style="margin-top: 30px;">
            <p style="font-weight: bold; margin-bottom: 15px;">あなたの返事は？</p>
            <div class="choices" id="choices"></div>
        </div>
    `;
    
    const choicesDiv = document.getElementById('choices');
    scenario.messages[1].choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = choice.text;
        btn.onclick = () => selectChoice(choice, btn);
        choicesDiv.appendChild(btn);
    });
}

function selectChoice(choice, btn) {
    // 全ボタンを無効化
    const allBtns = document.querySelectorAll('.choice-btn');
    allBtns.forEach(b => b.style.pointerEvents = 'none');
    
    if (choice.correct) {
        btn.classList.add('correct');
        setTimeout(() => {
            alert(`✅ ${choice.feedback}\n\n実際の会話でも使ってみよう！`);
            
            // 週間使用数を増やす
            let weeklyUsed = parseInt(localStorage.getItem('weeklyUsed') || '0');
            weeklyUsed++;
            localStorage.setItem('weeklyUsed', weeklyUsed);
            updateStats();
        }, 500);
    } else {
        btn.classList.add('incorrect');
        setTimeout(() => {
            alert(`❌ ${choice.feedback}\n\nもう一度トライしてみよう！`);
            // ボタンを再度有効化
            allBtns.forEach(b => {
                b.style.pointerEvents = 'auto';
                b.classList.remove('incorrect');
            });
        }, 500);
    }
}

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', () => {
    showDailyPhrase();
    updateStats();
    
    // 今日のミッション進捗を復元
    const today = new Date().toDateString();
    const savedProgress = localStorage.getItem('dailyMissionProgress');
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.date === today) {
            if (progress.task1) {
                document.getElementById('task1').checked = true;
                document.getElementById('task1').parentElement.classList.add('completed');
            }
            if (progress.task2) {
                document.getElementById('task2').checked = true;
                document.getElementById('task2').parentElement.classList.add('completed');
            }
            if (progress.task3) {
                document.getElementById('task3').checked = true;
                document.getElementById('task3').parentElement.classList.add('completed');
            }
        }
    }
});

// タッチスワイプ対応（スマホ用）
let touchStartX = 0;
let touchEndX = 0;

document.querySelectorAll('.carousel-track').forEach(carousel => {
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(carousel);
    });
});

function handleSwipe(carousel) {
    if (touchEndX < touchStartX - 50) {
        // 左スワイプ
        carousel.scrollLeft += 325;
    }
    if (touchEndX > touchStartX + 50) {
        // 右スワイプ
        carousel.scrollLeft -= 325;
    }
}
