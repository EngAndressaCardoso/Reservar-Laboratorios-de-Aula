# Diagrama de Caso de Uso

```mermaid
flowchart LR
    Professor([Professor])

    subgraph Sistema["SISTEMA DE RESERVA DE LABORATÓRIOS"]
        RF01([Consultar Laboratórios<br/>RF01])
        RF02([Realizar Reserva<br/>RF02])
        RF03([Validar Reserva<br/>RF03])
        RF04([Confirmar Reserva<br/>RF04])
        RF05([Listar Reservas<br/>RF05])

        RF02 -.->|«include»| RF03
        RF03 -.->|«include»| RF04
    end

    Professor --- RF01
    Professor --- RF02
    Professor --- RF05
```
