package br.com.flexmedia.checkinhub.modules.checkout;

import br.com.flexmedia.checkinhub.modules.hotel.dto.ReservaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final CheckoutService checkoutService;

    @GetMapping("/reserva/{codigoOuCpf}")
    public ReservaResponseDTO buscar(@PathVariable String codigoOuCpf) {
        return checkoutService.buscarParaCheckout(codigoOuCpf);
    }

    @PostMapping("/confirmar/{reservaId}")
    public ReservaResponseDTO confirmar(@PathVariable Long reservaId) {
        return checkoutService.confirmarCheckout(reservaId);
    }
}
