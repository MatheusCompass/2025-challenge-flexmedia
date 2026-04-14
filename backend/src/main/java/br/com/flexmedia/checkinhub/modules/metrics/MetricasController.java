package br.com.flexmedia.checkinhub.modules.metrics;

import br.com.flexmedia.checkinhub.modules.metrics.dto.DashboardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metricas")
@RequiredArgsConstructor
public class MetricasController {

    private final MetricasService metricasService;

    @GetMapping("/dashboard")
    public DashboardDTO dashboard(@RequestParam(required = false) Long hotelId) {
        return metricasService.getDashboard(hotelId);
    }

    @GetMapping("/historico")
    public List<DashboardDTO.MetricaDiaDTO> historico(
            @RequestParam Long hotelId,
            @RequestParam(defaultValue = "30") int dias) {
        return metricasService.getHistorico(hotelId, dias);
    }
}
