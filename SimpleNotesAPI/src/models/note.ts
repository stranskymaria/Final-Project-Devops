
import { RowDataPacket } from 'mysql2';

export interface Note {
    id: number;
    title: string;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export interface Note extends RowDataPacket {}
