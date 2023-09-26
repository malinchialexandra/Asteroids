// Definirea variabilelor globale
let canvas; // Variabila pentru canvas-ul HTML
let ctx; // Contextul de desenare al canvas-ului
let latimeCanvas = 1000; // Latimea canvas-ului
let inaltimeCanvas = 700; // Inaltimea canvas-ului
let nava; // Obiectul pentru nava
let keys = []; // Array pentru stocarea tastelor apasate
let rachete = []; // Array pentru stocarea rachetelor
let asteroizi = []; // Array pentru stocarea asteroizilor
let score = 0; // Scorul jucatorului
let lives = 3; // Numarul de vieti
let collisionDetected = false; // Variabila pentru a urmari daca a avut loc o coliziune

// Evenimentul care se declanseaza atunci cand se incarca pagina
document.addEventListener('DOMContentLoaded', SetupCanvas);

// Initializarea canvasului si a contextului 2D
function SetupCanvas(){
    canvas=document.getElementById('canvas_id');
    console.log(canvas);
    ctx=canvas.getContext('2d');
    console.log(ctx);
    canvas.width=latimeCanvas;
    canvas.height=inaltimeCanvas;
    ctx.fillStyle='black';
    ctx.fillRect(0,0,canvas.width, canvas.height);
    nava = new Nava(); // Initializarea navei
    // Generarea asteroizilor initiali
    for(let i=0; i<5; i++){
        asteroizi.push(new Asteroid(latimeCanvas / 2, inaltimeCanvas / 2, 50, 1, 46));
    }

    // Evenimentele pentru apasarea si eliberarea tastelor
    document.body.addEventListener("keydown", function(e){
        keys[e.key] = true;

        // Setarea flagului de deplasare inainte a navei
        if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
            nava.inainte = true;
        }   
        // Rotirea navei la stanga
        if (keys['z']) {
            nava.Rotate(-1);
        }
        // Rotirea navei la dreapta
        if (keys['c']) {
            nava.Rotate(1);
        }
    });
    document.body.addEventListener("keyup", function(e){
        keys[e.key] = false;

        // Dezactivarea deplasarii inainte a navei
        if (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight']) {
        nava.inainte = false;
    }
     // Lansarea unei rachete
        if (keys['x']) {
        rachete.push(new Racheta(nava.unghi));
    }
    });
    Deseneaza(); // Initializarea buclei de desenare
}

  //Desenare numar de vieti pe ecran
  function DrawLives() {
    ctx.fillStyle = 'white';
    ctx.font = '21px Arial';
    ctx.fillText('LIVES: ' + lives.toString(), 20, 70);
  }

// Clasa pentru reprezentarea navei
class Nava{
    constructor(){
        this.visible = true;
        this.x = latimeCanvas / 2;
        this.y = inaltimeCanvas / 2;
        this.inainte=false;
        this.viteza = 0.1;
        this.vitezaX = 0;
        this.vitezaY = 0;
        this.vitezaRotatie = 0.001;
        this.raza = 15;
        this.unghi = 0;
        this.strokeColor='white';
        this.varfX = latimeCanvas / 2 + 15;
        this.varfY = inaltimeCanvas / 2;
        this.racheteActive = 0; // Numarul de rachete active
    }

    // Metoda pentru rotirea navei
    Rotate(dir){
        this.unghi +=this.vitezaRotatie * dir;
    }
    // Metoda pentru actualizarea pozitiei navei
    Update(){
        //Schimbam grade in radians pentru calcule mai usoare
        let radians = this.unghi / Math.PI * 180;

        // Actualizarea pozitiei navei in functie de viteza
        if(this.inainte){
            this.vitezaX += Math.cos(radians) * this.viteza;
            this.vitezaY += Math.sin(radians) * this.viteza;
        }

        // Verificarea si ajustarea pozitiei navei in cazul in care aceasta depaseste marginile canvasului
        //mutare de la stanga la maxim dreapta
        if(this.x < this.raza){
            this.x = canvas.width;
        }
        //mutare la maxim stanga
        if(this.x > canvas.width){
            this.x=this.raza;
        }
        //sus
        if(this.y <this.raza){
            this.y=canvas.height;
        }
        //jos
        if(this.y>canvas.height){
            this.y=this.raza;
        }
        // Reducerea vitezei navei (franare)
        this.vitezaX *= 0.99;
        this.vitezaY *= 0.99;
        this.x -=this.vitezaX;
        this.y -= this.vitezaY;

        //Conditie ca nava sa poata impusca doar 3 rachete simultan
        if (keys['x'] && this.racheteActive < 3) {
            rachete.push(new Racheta(nava.unghi));
            this.racheteActive++; // creste numarul de rachete active
          }
    }
    // Metoda pentru desenarea navei
    Draw(){
        ctx.strokeStyle = this.strokeColor;
        ctx.beginPath(); // Incepe un nou desen
        let unghiVertical = ((Math.PI * 2) / 3); // Calculeaza unghiul vertical pentru varfurile triunghiului navei
        let radians = this.unghi / Math.PI * 180; // Calculeaza unghiul in radiani pentru rotatia navei
        this.varfX = this.x - this.raza * Math.cos(radians); // Calculeaza pozitia X a varfului navei
        this.varfY = this.y - this.raza * Math.sin(radians); // Calculeaza pozitia Y a varfului navei
        // Se adauga linii intre punctele triunghiului navei
        for(let i = 0; i < 3; i++){
            ctx.lineTo(this.x - this.raza * Math.cos(unghiVertical * i + radians),
            this.y - this.raza * Math.sin(unghiVertical * i + radians));
        }
        ctx.closePath();
        ctx.stroke();

    }
}
// Clasa pentru reprezentarea rachetelor
class Racheta{
    constructor(unghi){
        this.visible = true;
        this.x = nava.varfX;
        this.y=nava.varfY;
        this.unghi=unghi;
        this.height=4;
        this.width=4;
        this.viteza=5;
        this.vitezaX=0;
        this.vitezaY=0;

    }
    // Metoda pentru actualizarea pozitiei rachetelor
    Update(){
        var radians= this.unghi / Math.PI * 180; // Calculeaza unghiul in radiani pentru directia rachetei
        this.x -=Math.cos(radians) * this.viteza; // Actualizeaza pozitia X a rachetei in functie de directie si viteza
        this.y -=Math.sin(radians) * this.viteza; // Actualizeaza pozitia Y a rachetei in functie de directie si viteza
    }
    // Metoda pentru desenarea rachetelor
    Draw(){
        ctx.fillStyle="white";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// Clasa pentru reprezentarea asteroizilor
class Asteroid{
    constructor(x,y, raza, nivel, razaColiziune){
        this.visible = true;
        this.x = x || Math.floor(Math.random() * latimeCanvas); // Pozitia pe axa X a asteroidului
        this.y = y || Math.floor(Math.random() * inaltimeCanvas); // Pozitia pe axa Y a asteroidului
        this. viteza = 5;
        this.raza= raza || 50;
        this.unghi = Math.floor(Math.random() * 359); // Unghiul de rotatie al asteroidului
        this.strokeColor = 'white';
        this.razaColiziune = razaColiziune || 46; // Raza de coliziune
        this.nivel = nivel || 1;  // Nivelul asteroizilor
        this.rocketCount = Math.floor(Math.random() * 4) + 1; // Numarul de rachete necesare pentru distrugerea asteroidului
    }
    // Metoda pentru actualizarea pozitiei asteroizilor
    Update(){
        var radians = this.unghi / Math.PI * 180; // Conversia unghiului in radiani
        this.x +=Math.cos(radians) * this.viteza; // Actualizarea pozitiei asteroidului pe axa X in functie de cosinusul unghiului si viteza
        this.y +=Math.sin(radians) * this.viteza; // Actualizarea pozitiei asteroidului pe axa Y in functie de sinusul unghiului si viteza
        // Verificarea si ajustarea pozitiei asteroizilor in cazul in care acestia depasesc marginile canvasului
        if(this.x < this.raza){
            this.x = canvas.width;
        }
        if (
            this.x < -this.razaColiziune ||
            this.x > latimeCanvas + this.razaColiziune ||
            this.y < -this.razaColiziune ||
            this.y > inaltimeCanvas + this.razaColiziune
          ) {
            // Elimina asteroidul din array-ul `asteroizi`
            const index = asteroizi.indexOf(this);
            if (index !== -1) {
              asteroizi.splice(index, 1);
            }
            if (asteroizi.length === 0) {
                asteroizi.push(new Asteroid()); // Adaugarea unui nou asteroid in cazul in care nu mai exista asteroizi
              }
          }
        //mutarea la stanga
        if(this.x > canvas.width){
            this.x=this.raza;
        }
        //sus
        if(this.y <this.raza){
            this.y=canvas.height;
        }
        //jos
        if(this.y>canvas.height){
            this.y=this.raza;
        }

    }
    // Metoda pentru desenarea asteroizilor
    Draw(){
        ctx.beginPath();
    ctx.arc(this.x, this.y, this.raza, 0, Math.PI * 2); // Deseneaza un cerc cu coordonatele (x, y), raza si unghiul de la 0 la 2*PI
    ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(this.rocketCount.toString(), this.x - 5, this.y + 5); // Deseneaza numarul de rachete in interiorul asteroidului la pozitia (x-5, y+5)
    }
    // Verifica coliziunea cu rachetele
  checkRachetaCollision(racheta) {
    if (
      Coliziune(
        racheta.x,
        racheta.y,
        racheta.width / 2,
        this.x,
        this.y,
        this.razaColiziune
      )
    ) {
      this.rocketCount--; // Scade numarul de rachete necesare pentru distrugere

      if (this.rocketCount <= 0) {
        // Distrugere asteroid
        this.visible = false;
        score += 20;
      }

      return true;
    }

    return false;
  }
  checkAsteroidCollision(otherAsteroids) {
    for (let i = 0; i < otherAsteroids.length; i++) {
      if (otherAsteroids[i] !== this && Coliziune(this.x, this.y, this.raza, otherAsteroids[i].x, otherAsteroids[i].y, otherAsteroids[i].raza)) {
        // Calculam unghiul de coliziune intre asteroizi
        const unghi = Math.atan2(otherAsteroids[i].y - this.y, otherAsteroids[i].x - this.x);
        // Modificam traiectoria curenta a asteroidului
        this.unghi = unghi;
        // Modificam traiectoria asteroidului cu care a avut loc coliziunea
        otherAsteroids[i].unghi = unghi + Math.PI;
        break;
      }
    }
  }
}
//coliziuni
function Coliziune(p1x, p1y, r1, p2x, p2y, r2){
  let razaSum;
  let xDif;
  let yDif;
  // Calculeaza suma razelor
  razaSum = r1 +r2;
   // Calculeaza diferenta de coordonate pe axa x
  xDif= p1x-p2x;
  // Calculeaza diferenta de coordonate pe axa y
  yDif=p1y-p2y;
  // Verifica daca suma razelor este mai mare decat distanta dintre puncte
  if(razaSum > Math.sqrt((xDif * xDif)+ (yDif *yDif))){
      return true; // Exista coliziune
  }else {
      return false; // Nu exista coliziune
  }
}
function checkNavaCollisions() {
    for (let i = 0; i < asteroizi.length; i++) {
      // Verifica daca exista coliziune intre nava si asteroidul curent
        if (Coliziune(nava.x, nava.y, 11, asteroizi[i].x, asteroizi[i].y, asteroizi[i].razaColiziune)) {
          // Verifica daca nava este vizibila (nu a fost deja distrusa)
            if (nava.visible) {
              // Marcheaza nava ca invizibila
                nava.visible = false;
                // Scade un punctaj de viata
                lives -= 1;
                // Verifica daca nava nu mai are vieti disponibile
                if (lives <= 0) {
                    ResetGame(); // Reseteaza jocul
                } else {
                  // Restaureaza pozitia si starea initiala a navei
                    nava.x = latimeCanvas / 2;
                    nava.y = inaltimeCanvas / 2;
                    nava.vitezaX = 0;
                    nava.vitezaY = 0;
                    nava.rotation = 0;
                    nava.visible = true;
                }
                break;
            }
        }
    }
}
  function ResetGame() {
    // Reseteaza scorul si numarul de vieti
    score = 0;
    lives = 3;
    // Restaureaza starea initiala a navei
    nava.visible = true;
    nava.x = latimeCanvas / 2;
    nava.y = inaltimeCanvas / 2;
    nava.vitezaX = 0;
    nava.vitezaY = 0;
    nava.rotation = 0;
    // Goleste listele de asteroizi si rachete
    asteroizi = [];
    rachete = [];
    // Adauga noi asteroizi in lista
    for (let i = 0; i < 5; i++) {
      asteroizi.push(new Asteroid());
    }
    // Reseteaza variabila care indica detectarea coliziunii
    collisionDetected = false;
  }

//Functie pentru updatarea si desenarea formelor
function Deseneaza(){
   // Verificarea si setarea directiei de deplasare a navei in functie de tasta apasata
    if (keys['ArrowUp']) {
        nava.inainte = true;
    } else {
        nava.inainte = false;
    }
    // Rotirea navei in stanga cand se apasa tasta sageata stanga
    if (keys['ArrowLeft']) {
        nava.Rotate(-1);
    }
    
    // Rotirea navei in dreapta cand se apasa tasta sageata dreapta
    if (keys['ArrowRight']) {
        nava.Rotate(1);
    }

    // Sterge canvas-ul pentru a curata desenul anterior
    ctx.clearRect(0,0, latimeCanvas, inaltimeCanvas);

    // Actualizeaza si deseneaza nava
    nava.Update();
    nava.Draw();
    // Deseneaza scorul in coltul din stanga sus al canvas-ului
    ctx.fillStyle = 'white';
    ctx.font='21px Arial';
    ctx.fillText('SCORE: '+ score.toString(), 20, 35);

    // Verifica si afiseaza mesajul "GAME OVER" si reseteaza jocul daca nu mai sunt vieti disponibile
    if (lives <= 0 && nava.visible) {
        nava.visible = false;
        ctx.fillStyle = 'white';
        ctx.font = '50px Arial';
        ctx.fillText('GAME OVER', latimeCanvas / 2 - 150, inaltimeCanvas / 2);
        ResetGame();
      }
      // Actualizeaza si deseneaza asteroizii existenti
    if (asteroizi.length !== 0) {
        for (let j = 0; j < asteroizi.length; j++) {
          asteroizi[j].Update();
          asteroizi[j].checkAsteroidCollision(asteroizi); // Verificam coliziunea cu alti asteroizi
          asteroizi[j].Draw(j);
        }
    }
    // Deseneaza numarul de vieti ramase
    DrawLives();
    // Verifica si gestioneaza coliziunile dintre nava si asteroizi
    if (asteroizi.length !== 0) {
        for (let k = 0; k < asteroizi.length; k++) {
          if (
            Coliziune(
              nava.x,
              nava.y,
              11,
              asteroizi[k].x,
              asteroizi[k].y,
              asteroizi[k].razaColiziune
            )
          ) {
            if (!collisionDetected) {
              // Executa doar o data la detectarea coliziunii
              nava.x = latimeCanvas / 2;
              nava.y = inaltimeCanvas / 2;
              nava.vitezaX = 0;
              nava.vitezaY = 0;
              nava.rotation = 0;
              lives -= 1;
              collisionDetected = true; // Seteaza flag-ul coliziunii detectate
            }
          } else {
            collisionDetected = false; // Reseteaza flag-ul coliziunii detectate daca nu mai exista coliziune
          }
        }
      }
      // Verifica si gestioneaza coliziunile dintre rachete si asteroizi
    if (asteroizi.length !== 0 && rachete.length !== 0) {
        loop1: for (let l = 0; l < asteroizi.length; l++) {
          for (let m = 0; m < rachete.length; m++) {
            if (asteroizi[l].checkRachetaCollision(rachete[m])) {
              rachete.splice(m, 1);
              asteroizi.splice(l, 1); // Distrugerea asteroidului
                score += 20; // Actualizarea scorului
                if (score % 100 === 0) {
                    lives += 1; // Cresterea numarului de vieti la fiecare 100 de puncte
                }
              break loop1; // Iesi din bucla in cazul unei coliziuni
      
            }
          }
        }
      }
      // Actualizeaza si deseneaza nava
    if(nava.visible){
        nava.Update();
        nava.Draw();

    }
   // Actualizeaza si deseneaza rachetele
    if(rachete.length !== 0){
        for(let i=0; i< rachete.length; i++){
            rachete[i].Update();
            rachete[i].Draw();
        }
    }
    // Lansarea unei noi rachete atunci cand se apasa tasta 'x'
    if (keys['x'] && rachete.length < 3) {
        // Lanseaza o noua racheta
        const racheta = new Racheta(nava.x, nava.y, nava.rotation);
        rachete.push(racheta);
    }
    // Actualizeaza si deseneaza asteroizii
    if(asteroizi.length !== 0){
        for(let j=0; j< asteroizi.length; j++){
            asteroizi[j].Update();
            asteroizi[j].Draw(j);
        }
    }
    // Se apeleaza recursiv pentru a crea o bucla de animatie
    requestAnimationFrame(Deseneaza);
}