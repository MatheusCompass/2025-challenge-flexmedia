package br.com.flexmedia.checkinhub.modules.metrics;

import br.com.flexmedia.checkinhub.modules.hotel.HotelRepository;
import br.com.flexmedia.checkinhub.modules.metrics.dto.DashboardDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MetricasService {

    private final MetricaDiariaRepository metricaDiariaRepository;
    private final HotelRepository hotelRepository;

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM");

    public DashboardDTO getDashboard(Long hotelId) {
        LocalDate hoje = LocalDate.now();

        long checkinsHoje = hotelId != null
                ? getOuCriar(hotelId, hoje).getTotalCheckins()
                : coalesce(metricaDiariaRepository.sumTotalCheckinsByData(hoje));

        long checkoutsHoje = hotelId != null
                ? getOuCriar(hotelId, hoje).getTotalCheckouts()
                : coalesce(metricaDiariaRepository.sumTotalCheckoutsByData(hoje));

        long chavesHoje = hotelId != null
                ? getOuCriar(hotelId, hoje).getTotalChavesEmitidas()
                : coalesce(metricaDiariaRepository.sumTotalChavesByData(hoje));

        long hoteisAtivos = hotelRepository.findAllByAtivoTrue().size();

        List<DashboardDTO.MetricaDiaDTO> historico = buildHistorico(hotelId, hoje.minusDays(6), hoje);

        return new DashboardDTO(checkinsHoje, checkoutsHoje, chavesHoje, 0, hoteisAtivos, historico);
    }

    public List<DashboardDTO.MetricaDiaDTO> getHistorico(Long hotelId, int dias) {
        LocalDate fim = LocalDate.now();
        LocalDate inicio = fim.minusDays(dias - 1L);
        return buildHistorico(hotelId, inicio, fim);
    }

    @Transactional
    public void registrarCheckin(Long hotelId) {
        MetricaDiaria m = getOuCriar(hotelId, LocalDate.now());
        m.setTotalCheckins(m.getTotalCheckins() + 1);
        metricaDiariaRepository.save(m);
    }

    @Transactional
    public void registrarCheckout(Long hotelId) {
        MetricaDiaria m = getOuCriar(hotelId, LocalDate.now());
        m.setTotalCheckouts(m.getTotalCheckouts() + 1);
        metricaDiariaRepository.save(m);
    }

    @Transactional
    public void registrarChaveEmitida(Long hotelId) {
        MetricaDiaria m = getOuCriar(hotelId, LocalDate.now());
        m.setTotalChavesEmitidas(m.getTotalChavesEmitidas() + 1);
        metricaDiariaRepository.save(m);
    }

    // --- helpers ---

    private MetricaDiaria getOuCriar(Long hotelId, LocalDate data) {
        return metricaDiariaRepository.findByHotelIdAndData(hotelId, data)
                .orElseGet(() -> {
                    MetricaDiaria nova = MetricaDiaria.builder()
                            .hotel(hotelRepository.getReferenceById(hotelId))
                            .data(data)
                            .build();
                    return metricaDiariaRepository.save(nova);
                });
    }

    private List<DashboardDTO.MetricaDiaDTO> buildHistorico(Long hotelId, LocalDate inicio, LocalDate fim) {
        if (hotelId == null) return List.of();
        return metricaDiariaRepository
                .findByHotelIdAndDataBetweenOrderByDataAsc(hotelId, inicio, fim)
                .stream()
                .map(m -> new DashboardDTO.MetricaDiaDTO(
                        m.getData().format(FMT), m.getTotalCheckins(), m.getTotalCheckouts(), m.getTotalChavesEmitidas()))
                .toList();
    }

    private long coalesce(Long val) {
        return val != null ? val : 0L;
    }
}
