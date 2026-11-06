* {
    box-sizing: border-box;
}

body {
    margin: 0;
    padding: 20px;
    background: #050b0a;
    color: white;
    font-family: Arial, sans-serif;
    text-align: center;
}

header {
    padding: 25px 10px;
}

header h1 {
    font-size: 42px;
    color: white;
}

header span {
    color: #00e676;
}

header p {
    color: #a9b7ca;
}

main {
    max-width: 450px;
    margin: auto;
}

.welcome,
.form-box {
    background: #10201b;
    padding: 25px;
    border-radius: 18px;
    margin: 20px 0;
}

h2 {
    color: #00e676;
}

input {
    width: 100%;
    padding: 14px;
    margin: 9px 0;
    border: 1px solid #315344;
    border-radius: 10px;
    background: #07120e;
    color: white;
    font-size: 15px;
}

button {
    width: 100%;
    padding: 14px;
    margin: 8px 0;
    border: none;
    border-radius: 10px;
    background: #00e676;
    color: #001b0d;
    font-weight: bold;
    font-size: 16px;
}

.secondary {
    background: #263b32;
    color: white;
}

.google {
    background: white;
    color: #222;
}

.hidden {
    display: none;
}

.features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 25px;
}

.features div {
    padding: 20px 10px;
    background: #10201b;
    border: 1px solid #244b38;
    border-radius: 12px;
}

#message {
    color: #00e676;
    overflow-wrap: anywhere;
}
