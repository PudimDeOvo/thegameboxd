from datetime import datetime
from sqlalchemy import (
    String, ForeignKey, Table, Column, Text, Float, Date,
    UniqueConstraint
)
from app.database.connection import Base
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

@Base.registry.mapped_as_dataclass
class JogoWatchlist:
    __tablename__ = "watchlist_jogo"

    id_watchlist: Mapped[int] = mapped_column(
        ForeignKey("watchlists.id_watchlist", ondelete="CASCADE"), primary_key=True
    )
    id_jogo: Mapped[int] = mapped_column(
        ForeignKey("jogos.id_jogo"), primary_key=True
    )

    status_jogo: Mapped[str] = mapped_column(
        String(50), 
        default="AINDA NAO JOGADO", 
        server_default="AINDA NAO JOGADO",
        nullable=False
    )

    watchlist: Mapped["Watchlist"] = relationship(init=False, back_populates="jogos_associacao")
    jogo: Mapped["Jogo"] = relationship(init=False, back_populates="watchlists_associacao")

jogo_genero_table = Table(
    "jogo_genero",
    Base.metadata,
    Column("id_jogo", ForeignKey("jogos.id_jogo"), primary_key=True),
    Column("id_genero", ForeignKey("generos.id_genero"), primary_key=True),
)


@Base.registry.mapped_as_dataclass
class User:
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(init=False, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    profile_pic_url: Mapped[str | None] = mapped_column(String(255), default=None)
    background_pic_url: Mapped[str | None] = mapped_column(String(255), default=None)
    
    admin: Mapped[bool] = mapped_column(
        init=False, default=False, server_default='false', nullable=False
    )
    
    watchlists: Mapped[list["Watchlist"]] = relationship(
        init=False, back_populates="user", cascade="all, delete-orphan"
    )
    avaliacoes: Mapped[list["Avaliacao"]] = relationship(
        init=False, back_populates="user", cascade="all, delete-orphan"
    )

@Base.registry.mapped_as_dataclass
class Jogo:
    __tablename__ = "jogos"

    id_jogo: Mapped[int] = mapped_column(init=False, primary_key=True)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)

    id_desenvolvedor: Mapped[int | None] = mapped_column(
        ForeignKey("desenvolvedoras.id_empresa"), nullable=True, default=None
    )
    
    descricao: Mapped[str | None] = mapped_column(Text, default=None)
    nota_metacritic: Mapped[int | None] = mapped_column(default=None)
    capa_url: Mapped[str | None] = mapped_column(String(255), default=None)
    id_publicadora: Mapped[int | None] = mapped_column(
        ForeignKey("publicadoras.id_empresa"), default=None, nullable=True
    )

    desenvolvedora: Mapped["Desenvolvedora"] = relationship(
        init=False, back_populates="jogos_desenvolvidos", foreign_keys=[id_desenvolvedor]
    )
    publicadora: Mapped["Publicadora"] = relationship(
        init=False, back_populates="jogos_publicados", foreign_keys=[id_publicadora]
    )
    
    dlcs: Mapped[list["DLC"]] = relationship(
        init=False, back_populates="jogo", cascade="all, delete-orphan"
    )
    
    plataformas_associacao: Mapped[list["JogoPlataforma"]] = relationship(
        init=False, back_populates="jogo", cascade="all, delete-orphan"
    )

    avaliacoes: Mapped[list["Avaliacao"]] = relationship(
        init=False, back_populates="jogo", cascade="all, delete-orphan"
    )

    watchlists_associacao: Mapped[list["JogoWatchlist"]] = relationship(
            init=False, 
            back_populates="jogo"
        )

    @property
    def watchlists(self) -> list["Watchlist"]:
        return [assoc.watchlist for assoc in self.watchlists_associacao]

    generos: Mapped[list["Genero"]] = relationship(
        init=False, secondary=jogo_genero_table, back_populates="jogos"
    )

@Base.registry.mapped_as_dataclass
class Watchlist:
    __tablename__ = "watchlists"
    
    id_watchlist: Mapped[int] = mapped_column(init=False, primary_key=True) 
    
    id_user: Mapped[int] = mapped_column(
        ForeignKey("users.id"), nullable=False
    )

    nome: Mapped[str] = mapped_column(String(100), nullable=True)
    
    user: Mapped["User"] = relationship(init=False, back_populates="watchlists")
    

    jogos_associacao: Mapped[list["JogoWatchlist"]] = relationship(
        init=False, 
        back_populates="watchlist",
    )


    @property
    def jogos(self) -> list["Jogo"]:
            return [assoc.jogo for assoc in self.jogos_associacao]

@Base.registry.mapped_as_dataclass
class Genero:
    __tablename__ = "generos"

    id_genero: Mapped[int] = mapped_column(init=False, primary_key=True)
    nome_genero: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    jogos: Mapped[list["Jogo"]] = relationship(
        init=False, secondary=jogo_genero_table, back_populates="generos"
    )

@Base.registry.mapped_as_dataclass
class Plataforma:

    __tablename__ = "plataformas"

    id_plataforma: Mapped[int] = mapped_column(init=False, primary_key=True)
    nome: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    jogos_associacao: Mapped[list["JogoPlataforma"]] = relationship(
        init=False, back_populates="plataforma", cascade="all, delete-orphan"
    )


@Base.registry.mapped_as_dataclass
class Empresa:
    __tablename__ = "empresas"

    id_empresa: Mapped[int] = mapped_column(init=False, primary_key=True)
    nome: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    tipo_empresa: Mapped[str] = mapped_column(String(50))
    data_fundacao: Mapped[datetime | None] = mapped_column(Date, default=None)
    pais_origem: Mapped[str | None] = mapped_column(String(100), default=None)

    __mapper_args__ = {
        "polymorphic_identity": "empresa",
        "polymorphic_on": tipo_empresa,
    }

@Base.registry.mapped_as_dataclass
class Desenvolvedora(Empresa):
    __tablename__ = "desenvolvedoras"

    id_empresa: Mapped[int] = mapped_column(
        ForeignKey("empresas.id_empresa"), primary_key=True, init=False
    )
    mercado_principal: Mapped[str | None] = mapped_column(String(255), default=None)

    __mapper_args__ = {"polymorphic_identity": "desenvolvedora"}

    jogos_desenvolvidos: Mapped[list["Jogo"]] = relationship(
        init=False, back_populates="desenvolvedora", foreign_keys="[Jogo.id_desenvolvedor]"
    )

@Base.registry.mapped_as_dataclass
class Publicadora(Empresa):
    __tablename__ = "publicadoras"

    id_empresa: Mapped[int] = mapped_column(
        ForeignKey("empresas.id_empresa"), primary_key=True, init=False
    )
    mercado_principal: Mapped[str | None] = mapped_column(String(255), default=None)

    __mapper_args__ = {"polymorphic_identity": "publicadora"}

    jogos_publicados: Mapped[list["Jogo"]] = relationship(
        init=False, back_populates="publicadora", foreign_keys="[Jogo.id_publicadora]"
    )


@Base.registry.mapped_as_dataclass
class DLC:
    __tablename__ = "dlcs"

    id_jogo: Mapped[int] = mapped_column(ForeignKey("jogos.id_jogo"), primary_key=True)
    nome_dlc: Mapped[str] = mapped_column(String(255), primary_key=True)
    descricao: Mapped[str | None] = mapped_column(Text, default=None)

    jogo: Mapped["Jogo"] = relationship(init=False, back_populates="dlcs")


@Base.registry.mapped_as_dataclass
class JogoPlataforma:

    __tablename__ = "jogo_plataformas"

    id_jogo: Mapped[int] = mapped_column(ForeignKey("jogos.id_jogo"), primary_key=True)
    id_plataforma: Mapped[int] = mapped_column(ForeignKey("plataformas.id_plataforma"), primary_key=True)
    
    data_lancamento: Mapped[datetime | None] = mapped_column(Date, default=None)
    
    jogo: Mapped["Jogo"] = relationship(init=False, back_populates="plataformas_associacao")
    plataforma: Mapped["Plataforma"] = relationship(init=False, back_populates="jogos_associacao")


@Base.registry.mapped_as_dataclass
class Avaliacao:
    __tablename__ = "avaliacoes"
    
    id_avaliacao: Mapped[int] = mapped_column(init=False, primary_key=True)
    nota: Mapped[float] = mapped_column(Float, nullable=False)
    
  
    id_jogo: Mapped[int] = mapped_column(ForeignKey("jogos.id_jogo"), nullable=False)
    id_user: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    comentario: Mapped[str | None] = mapped_column(Text, default=None)

    jogo: Mapped["Jogo"] = relationship(init=False, back_populates="avaliacoes")
    user: Mapped["User"] = relationship(init=False, back_populates="avaliacoes")