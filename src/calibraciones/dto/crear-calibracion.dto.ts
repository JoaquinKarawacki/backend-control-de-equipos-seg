import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearCalibracionDto{

    @IsString()
    @IsNotEmpty()
    equipoId!: string;
    
    @IsString()
    @IsNotEmpty()
    registradaPorId!: string;

    @IsDateString()
    @IsNotEmpty()
    fechaRealizada!: string;

    @IsDateString()
    @IsNotEmpty()
    fechaVencimiento!: string;

    @IsString()
    @IsOptional()
    laboratorio?: string;

    @IsString()
    @IsOptional()
    numeroCertificado?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
    
    @IsString()
    @IsOptional()
    motivoAnulacion?: string;
}