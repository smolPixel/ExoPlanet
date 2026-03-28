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

export function increaseStat(stat, value, player){
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
    else{
        throw new Error(`${stat} if not defined`)
    }

}

export function decreaseStat(stat, value, player){
    console.log(stat, value)
    if (stat == 'physical'){
        player.physical -= value ;
    }
    else if (stat == 'mental'){
        player.mental -= value ;
    }
    else if (stat == 'spiritual'){
        player.spiritual -= value ;
    }
    else if (stat == 'social_emotional'){
        player.social_emotional -= value ;
    }
    else if (stat == 'environmental'){
        player.environmental -= value ;
    }
    else{
        throw new Error(`${stat} if not defined`)
    }

}
