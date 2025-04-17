export interface Exchange {
    id: number;
    id_insertion: number;
    id_user: number;
    title: string;
    description: string;
    image_url: string;
    state: 'pending' | 'accepted' | 'refused';
    createdAt: Date;
}