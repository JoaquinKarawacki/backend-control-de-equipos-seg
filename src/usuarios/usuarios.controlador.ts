import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { UsuarioServicio } from './usuarios.servicio';
import { UseGuards } from '@nestjs/common';
import { JwtGuardia } from '../auth/jwt.guardia';

@Controller('usuarios')
export class UsuarioControlador{
    constructor(private readonly usuarioServicio: UsuarioServicio) {}
    
    @Post()
    crear(@Body() dto:CrearUsuarioDto){
        return this.usuarioServicio.crear(dto);
    }

    @UseGuards(JwtGuardia)
    @Get()
    obtenerTodos(){
        return this.usuarioServicio.obtenerTodos();
    }

    @Get(':id')
    obtenerPorId(@Param('id') id: string){
        return this.usuarioServicio.obtenerPorId(id);
    }

    @Patch(':id')
    actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto){
        return this.usuarioServicio.actualizar(id, dto)
    }
}