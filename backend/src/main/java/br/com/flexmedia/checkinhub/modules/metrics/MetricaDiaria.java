package br.com.flexmedia.checkinhub.modules.metrics;

import br.com.flexmedia.checkinhub.modules.hotel.Hotel;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "metricas_diarias", uniqueConstraints = {
        @UniqueConstraint(name = "uk_metrica_hotel_data", columnNames = {"hotel_id", "data"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MetricaDiaria {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "seq_metrica")
    @SequenceGenerator(name = "seq_metrica", sequenceName = "seq_metrica", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "total_checkins", nullable = false)
    @Builder.Default
    private int totalCheckins = 0;

    @Column(name = "total_checkouts", nullable = false)
    @Builder.Default
    private int totalCheckouts = 0;

    @Column(name = "total_chaves_emitidas", nullable = false)
    @Builder.Default
    private int totalChavesEmitidas = 0;
}
