import {hash} from 'bcrypt';
class User{
    private username: string;
    #password: string;
    public constructor(username: string, password: string){
        this.username = username;
        this.#password = password;
    }
    static async create(username: string, password: string) {
        const passwordHashed: string = await hash(password, 10);
        return new User(username, passwordHashed);
    }
}