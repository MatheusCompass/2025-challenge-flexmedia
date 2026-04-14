package br.com.flexmedia.checkinhub.modules.conteudo;

import br.com.flexmedia.checkinhub.modules.conteudo.dto.ConteudoTotemDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conteudo")
@RequiredArgsConstructor
public class ConteudoTotemController {

    private final ConteudoTotemService conteudoTotemService;

    @GetMapping
    public List<ConteudoTotemDTO> listar(
            @RequestParam Long hotelId,
            @RequestParam(defaultValue = "false") boolean apenasAtivos) {
        return apenasAtivos
                ? conteudoTotemService.listarAtivos(hotelId)
                : conteudoTotemService.listar(hotelId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConteudoTotemDTO criar(@Valid @RequestBody ConteudoTotemDTO dto) {
        return conteudoTotemService.criar(dto);
    }

    @PutMapping("/{id}")
    public ConteudoTotemDTO atualizar(@PathVariable Long id, @Valid @RequestBody ConteudoTotemDTO dto) {
        return conteudoTotemService.atualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remover(@PathVariable Long id) {
        conteudoTotemService.remover(id);
    }
}
