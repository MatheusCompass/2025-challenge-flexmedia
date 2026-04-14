package br.com.flexmedia.checkinhub.modules.hotel;

import br.com.flexmedia.checkinhub.modules.hotel.dto.ReservaRequestDTO;
import br.com.flexmedia.checkinhub.modules.hotel.dto.ReservaResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservaResponseDTO criar(@Valid @RequestBody ReservaRequestDTO dto) {
        return reservaService.criar(dto);
    }

    @GetMapping
    public Page<ReservaResponseDTO> listar(
            @RequestParam(required = false) Long hotelId,
            @RequestParam(required = false) String busca,
            @PageableDefault(size = 20) Pageable pageable) {
        return reservaService.listar(hotelId, busca, pageable);
    }

    @GetMapping("/{id}")
    public ReservaResponseDTO buscarPorId(@PathVariable Long id) {
        return reservaService.buscarPorId(id);
    }

    @GetMapping("/codigo/{codigo}")
    public ReservaResponseDTO buscarPorCodigo(@PathVariable String codigo) {
        return reservaService.buscarPorCodigo(codigo);
    }
}
