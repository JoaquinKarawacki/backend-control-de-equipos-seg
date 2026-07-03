import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';
import { ActualizarUsuarioDto } from './dto/actualizar-usuario.dto';
import { UsuarioServicio } from './usuarios.servicio';
import { JwtGuardia } from '../auth/jwt.guardia';

@Controller('usuarios')
export class UsuarioControlador{
    constructor(private readonly usuarioServicio: UsuarioServicio) {}

    @Post()
    // Sin guard a propósito: no hay seed/bootstrap todavía, así se
    // puede crear el primer usuario del sistema. Revisar cuando exista
    // un mecanismo de admin inicial.
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
    @UseGuards(JwtGuardia)
    actualizar(@Param('id') id: string, @Body() dto: ActualizarUsuarioDto, @Req() req: any){
        return this.usuarioServicio.actualizar(id, dto, {
            id: req.user.id,
            email: req.user.email,
        })
    }
}