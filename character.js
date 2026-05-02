export class character{
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

    iterate_values(){
        return {'physical': this.physical, 'mental': this.mental, 'spiritual': this.spiritual, 'social_emotional': this.social_emotional, 'environmental': this.environmental}
    }

    load_player(data){
    for (const [key, value] of Object.entries(data)) {
        if (key in this) this[key] = value
        }
    }

    set_char(stat, value){
        value = Math.max(1, value)
        if (stat == 'physical'){
                this.physical = value ;
            }
            else if (stat == 'mental'){
                this.mental = value ;
            }
            else if (stat == 'spiritual'){
                this.spiritual = value ;
            }
            else if (stat == 'social_emotional'){
                this.social_emotional = value ;
            }
            else if (stat == 'environmental'){
                this.environmental = value ;
            }
            else{
                throw new Error(`${stat} if not defined`)
            }
    }
 // TODO : 1- iterate over stat, 2- change how you load character
}

// Log-scale gain: full at stat=1, ~23% at stat=20, never reaches 0.
// ln(2)/ln(stat+1) — genuine log, no baked-in ceiling.
export function statGain(currentStat, base) {
    return base * Math.LN2 / Math.log(Math.max(1, currentStat) + 1);
}

export function increaseStat(stat, value, player){
    if (!(stat in player)) throw new Error(`${stat} is not defined`);
    player[stat] += statGain(player[stat], value);
}

export function decreaseStat(stat, value, player){
    if (!(stat in player)) throw new Error(`${stat} is not defined`);
    player[stat] -= statGain(player[stat], value);
}
