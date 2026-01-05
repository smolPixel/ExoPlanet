
//STUPID ASS IMPORT EXPORT AND JAVASCIPRT I HATE THIS LANGUAGE
// Character section
class character{
    constructor() {
        this.physical=1
        this.mental=1
        this.spiritual = 1
        this.social_emotional = 1
        this.environmental = 1
        this.current_assignment =  null
    }

    getmeanval(){
        return (this.physical+this.mental+this.spiritual+this.social_emotional+this.environmental)/5
    }
}
player = new character()

function increaseStat(stat, value){
    console.log(stat, value)
    if (stat == 'physical'){
        player.physical += value ;
    }
    else if (stat == 'mental'){
        player.mental += value ;
    }
    else if (stat == 'spiritual'){
        player.spiritual += value ;
    }
    else if (stat == 'social_emotional'){
        player.social_emotional += value ;
    }
    else if (stat == 'environmental'){
        player.environmental += value ;
    }

}


console.log(character)
class Resource {
    constructor(name, quantity, cost) {
        this.name=name
        this.quantity=quantity
        this.production = 0
        this.cost = cost
    }
}

class Creator {
    constructor(name, quantity, cost, create) {
        this.name=name
        this.quantity=quantity
        this.production = 0
        this.cost = cost
        this.create = create
    }
}



// Ressources
var dictionnary = {'Iron': new Resource(name="Iron", quantity=0, cost=[["Energy", 1]]),
                     'Energy': new Resource("Energy", 0, cost = []),
                     'Copper': new Resource("Copper", 0, cost=[["Energy", 1]]),
                     'Wood': new Resource("Wood", 0, cost=[["Energy", 1]]),
                     'Iron Plates': new Resource("Iron Plates", 0, cost=[["Energy", 1], ['Iron', 1]]),
                     'Screws': new Resource("Screws", 0, cost=[["Energy", 1], ['Iron', 1]]),
                     'Coils': new Resource("Coils", 0, cost=[["Energy", 1], ['Copper', 1]]),
                     'Wires': new Resource("Wires", 0, cost=[["Energy", 1], ['Coils', 1]]),
                     //Creator
                     'Iron Mines': new Creator("Iron Mines", 0, cost=[['Iron Plates', 5], ['Screws', 20], ['Iron', 20], ['Wires', 5]], create = [['Iron', 1]]) //cost=[['Iron Plates', 5], ['Screws', 20], ['Iron', 20], ['Wires', 5]])
                     }

function assignPlayer(ressource){
    console.log(ressource);
    player_production_speed = player.getmeanval()
    res = dictionnary[ressource];
    old_ass = player.current_assignment
    if (old_ass != null) {
        old_res = dictionnary[old_ass]
        old_res.production -= player_production_speed
        }
    player.current_assignment = ressource
    res.production += player_production_speed
}

const reslength = Object.keys(dictionnary).length

function updateResource(id, value){
    document.getElementById(id).innerHTML = Math.round(value);
}

function check_and_take_requirements(res){
    cost = res.cost
    // Loop 1 : check that all needed is available
    canProduce = true
    cost.forEach((x, i) => {
        name_dep = x[0]
        quantity_dep = x[1]
        if (dictionnary[name_dep].quantity < quantity_dep * res.production) {
            canProduce =false;
        }
    });
    if (canProduce == false){
        return false;
    }
    // Loop 2 : take ressources
    cost.forEach((x, i) => {
        name_dep = x[0]
        quantity_dep = x[1]
        dictionnary[name_dep].quantity -= quantity_dep * res.production
    });
    return true;
}

function DecreaseCreator(id){
    res = dictionnary[id]
    if (res.quantity==0){
        return;
    }
    // Give back requirements
    cost.forEach((x, i) => {
        name_dep = x[0]
        quantity_dep = x[1]
        res_dep = dictionnary[name_dep]
        res_dep.quantity +=quantity_dep
    });
    // Remove production
    res.quantity -=1;
    create = res.create;
    create.forEach((x, i) => {
        res_create = dictionnary[x[0]];
        res_create.production -=x[1];
    })

    if (correct == true){
        updateResource(res.name, res.quantity);
        };
}

function IncreaseCreator(id){
    res = dictionnary[id]
    correct = check_and_take_requirements(res)
    res.quantity +=1;
    create = res.create;
    create.forEach((x, i) => {
        res_create = dictionnary[x[0]];
        res_create.production +=x[1];
    })

    if (correct == true){
        updateResource(res.name, res.quantity);
        };
}

function TickResource(res){
    // Tick a single resource and update the GUI
    correct = check_and_take_requirements(res)
    if (correct == true){
        res.quantity += res.production ;
        updateResource(res.name, res.quantity);
    }
}

function TickEverything(){
    // Ressources
    for (let i=0; i<reslength ; i++){
        ressourceName = Object.keys(dictionnary)[i];
        ressource_to_tick = dictionnary[ressourceName];
        TickResource(ressource_to_tick);
    }
    // Stats
    document.getElementById('physical').innerHTML = player.physical;
    document.getElementById('mental').innerHTML = player.mental;
    document.getElementById('spiritual').innerHTML = player.spiritual;
    document.getElementById('social/emotional').innerHTML = player.social_emotional;
    document.getElementById('environmental').innerHTML = player.environmental;

    assignPlayer(player.current_assignment);

    SaveGame();
}




function fillResources(){
    for (var i=0 ; i<ressources.length; i++){
        resourceName = ressources[i].name
    }
}


// Save function


function SaveGame(){
    var save = {
        dico: dictionnary
    }

    localStorage.setItem("save", JSON.stringify(save));
}

function LoadGame(){
    var savegame = JSON.parse(localStorage.getItem("save"));
    dictionnary = savegame['dico']
    console.log(dictionnary)
}


window.onload = () => {
  console.log('loading game')
  LoadGame();
};

setInterval(TickEverything, 1000)

// Todo : storage ; phase 0, kelpy ; TODO list and character stats on screen ; split into multiple files ; github ; dev console ;
// Melvor ; game ; read ; tasklist ; free