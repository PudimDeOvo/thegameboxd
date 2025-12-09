import sqlite3
import os

DB_FILE = "watchlist.db"
SQL_SCRIPT_PATH = "app/database/database_schema.sql"

def init_db():

    if not os.path.exists(SQL_SCRIPT_PATH):
        print(f" Erro: Arquivo '{SQL_SCRIPT_PATH}' não encontrado.")
        return

    if os.path.exists(DB_FILE):
        print(f"  Removendo banco de dados antigo '{DB_FILE}'...")
        os.remove(DB_FILE)

    print(f" Criando novo banco de dados '{DB_FILE}'...")

    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()

        with open(SQL_SCRIPT_PATH, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        cursor.executescript(sql_script)
        conn.commit()
        
        print(" Banco de dados criado com sucesso!")
        

    except sqlite3.Error as e:
        print(f" Erro ao executar SQL: {e}")
    
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    init_db()