import sqlite3
import os

DB_NAME = "letterboxgame.db"
SQL_FILES = ["1_create.sql", "2_populate.sql"]

def init_db():
    if os.path.exists(DB_NAME):
        os.remove(DB_NAME)
        print("  Banco antigo removido.")

    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    try:
        for sql_file in SQL_FILES:
            if not os.path.exists(sql_file):
                print(" Erro: Arquivo não encontrado.")
                return

            print(f" Executando '{sql_file}'...")
            with open(sql_file, "r", encoding="utf-8") as f:
                sql_script = f.read()
                cursor.executescript(sql_script)

        conn.commit()
        print(" Sucesso! Banco  pronto para uso.")
        
    except Exception as e:
        print(f" Erro SQL: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()