package br.com.flexmedia.checkinhub.modules.hotel;

import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelRequestDTO;
import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hoteis")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;

    @GetMapping
    public Page<HotelResponseDTO> listar(@PageableDefault(size = 20) Pageable pageable) {
        return hotelService.listar(pageable);
    }

    @GetMapping("/{id}")
    public HotelResponseDTO buscarPorId(@PathVariable Long id) {
        return hotelService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HotelResponseDTO criar(@Valid @RequestBody HotelRequestDTO dto) {
        return hotelService.criar(dto);
    }

    @PutMapping("/{id}")
    public HotelResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody HotelRequestDTO dto) {
        return hotelService.atualizar(id, dto);
    }

    @PatchMapping("/{id}/desativar")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void desativar(@PathVariable Long id) {
        hotelService.desativar(id);
    }
}
