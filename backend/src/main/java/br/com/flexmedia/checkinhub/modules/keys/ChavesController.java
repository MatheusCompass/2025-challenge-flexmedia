package br.com.flexmedia.checkinhub.modules.keys;

import br.com.flexmedia.checkinhub.modules.keys.dto.ChaveResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chaves")
@RequiredArgsConstructor
public class ChavesController {

    private final ChavesService chavesService;

    @PostMapping("/{reservaId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ChaveResponseDTO emitir(@PathVariable Long reservaId) {
        return chavesService.emitirChave(reservaId);
    }
}
