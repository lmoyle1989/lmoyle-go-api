package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/exec"
	// "html/template"
	"net/http"
	"time"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type Page struct {
	Id []byte
	Title string
	Body []byte
	CreatedAt string
	UpdatedAt string
}

var DB *sql.DB

func main() {
	os.Remove("sqlite-database.db")

	file, err := os.Create("sqlite-database.db")
	if err != nil {
		log.Fatal(err.Error())
	}
	file.Close()
	
	DB, _ = sql.Open("sqlite3", "./sqlite-database.db")
	defer DB.Close()

	initializeDB(DB)
	
	insertPage(DB, "", []byte("Listening on 8080"))
	insertPage(DB, "", []byte(""))

	mypages, err := getPages(DB)
	if err != nil {
		log.Fatal(err.Error())
	}
	
	mypage, err := getPage(DB, mypages[0].Id)
	if err != nil {
		log.Fatal(err.Error())
	}

	fmt.Printf("%x - %s: %s - %s - %s\n", 
		mypage.Id,
		mypage.Title,
		mypage.Body,
		mypage.CreatedAt,
		mypage.UpdatedAt,
	)

	mux := http.NewServeMux()
	mux.HandleFunc("GET /", rootHandler)
	mux.HandleFunc("GET /page/{id}/", getPageByIdHandler)
	mux.HandleFunc("GET /pages/", getPagesHandler)
	mux.HandleFunc("GET /mystify/", getMystifyHandler)
	mux.HandleFunc("GET /starfield/", getStarfieldHandler)
	mux.HandleFunc("GET /maze/", getMazeHandler)
	mux.HandleFunc("GET /mazedata/", getMazeData)
	mux.HandleFunc("GET /pipes/", getPipesHandler)

    mux.Handle("GET /js/", http.StripPrefix("/js/", http.FileServer(http.Dir("./js")))) //why do I need stripprefix here?
	mux.Handle("GET /css/", http.StripPrefix("/css/", http.FileServer(http.Dir("./css"))))

	log.Fatal(http.ListenAndServe(":8080", mux))
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Slug: %s\nHeader: %s", r.URL.Path[1:], r.Header)
}

func getPageByIdHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Page: %s", r.PathValue("id"))
}

func getPagesHandler(w http.ResponseWriter, r *http.Request) {
	pages, err := getPages(DB)
	if err != nil {
		log.Fatal(err.Error())
	}

	for idx, page := range pages {
		fmt.Fprintf(w, "Page %d: %s\n\n", idx, page.Title)
	}
}

func initializeDB(db *sql.DB) {
	initPageSQL := `CREATE TABLE IF NOT EXISTS pages (
		id BLOB NOT NULL PRIMARY KEY,
		title TEXT NOT NULL,
		body BLOB NOT NULL,
		created_at TEXT NOT NULL,
		updated_at TEXT NOT NULL
	);`
	statement, err := db.Prepare(initPageSQL)
	if err != nil {
		log.Fatal(err.Error())
	}
	statement.Exec()
}

func insertPage(db *sql.DB, title string, body []byte) {
	insertPageSQL := `INSERT INTO pages(id, title, body, created_at, updated_at) VALUES(?, ?, ?, ?, ?);`
	statement, err := db.Prepare(insertPageSQL)
	if err != nil {
		log.Fatal(err.Error())
	}
	new_uuid := uuid.New()
	id, err := new_uuid.MarshalBinary()
	if err != nil {
		log.Fatal(err.Error())
	}
	created_at := time.Now().UTC().Format(time.RFC3339)
	statement.Exec(id, title, body, created_at, created_at)
}

func getPage(db *sql.DB, id []byte) (*Page, error) {
	query := `SELECT * FROM pages WHERE id = ?`
	row := db.QueryRow(query, id)
	var page Page
	err := row.Scan(&page.Id, &page.Title, &page.Body, &page.CreatedAt, &page.UpdatedAt)
	if err != nil {
		return nil, err
	}

	return &page, nil
}

func getPages(db *sql.DB) ([]Page, error) {
	rows, err := db.Query(`SELECT * FROM pages`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pages []Page
	for rows.Next() {
		var page Page
		err := rows.Scan(&page.Id, &page.Title, &page.Body, &page.CreatedAt, &page.UpdatedAt)
		if err != nil {
			return nil, err
		}
		pages = append(pages, page)
	}

	return pages, nil
}

func getMystifyHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "mystify.html")
}

func getStarfieldHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "starfield.html")
}

func getPipesHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "pipes.html")
}

func getMazeHandler(w http.ResponseWriter, r *http.Request) {
	// templateFile := "templates/base.tmpl"
	// template, err := template.New(templateFile).ParseFiles(templateFile)
	// if err != nil {
	// 	panic(err)
	// }
	// data, err := mazeDataJSON()
	// if err != nil {
	// 	return
	// }
	// template.Execute(os.Stdout, data)
	http.ServeFile(w, r, "maze.html")
}

func mazeDataJSON() ([]byte, error) {
	command := exec.Command("python3", "misc_stuff/maze.py", "json")
	output, err := command.Output()
	if err != nil {
		fmt.Println("Error running python script: ", err)
		return nil, err
	}
	return output, nil
}

func getMazeData(w http.ResponseWriter, _ *http.Request) {
	data, err := mazeDataJSON()
	if err != nil {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}