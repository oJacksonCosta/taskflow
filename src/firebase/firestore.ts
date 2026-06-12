// Libraries
import {
  collection,
  getDocs,
  orderBy,
  query,
  where,
  addDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  doc,
} from "firebase/firestore";

// Firebase / Services
import { db } from "./firebase-config";

// Types
import { Note } from "@/types";

const notesRef = collection(db, "notes");

const convertToDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value.toDate === "function") {
    return value.toDate();
  }
  if (value.seconds !== undefined) {
    return new Date(value.seconds * 1000);
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

export const getNotes = async (
  uid: string,
  filters: {
    type: string;
    status: string;
    priority: string;
    dateRange?: { from?: Date; to?: Date };
    tags: string[];
    searchText: string;
  },
) => {
  try {
    const q = query(
      notesRef,
      where("userId", "==", uid),
      orderBy("date", "desc"),
    );

    const snapshot = await getDocs(q);
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      uid: doc.data().userId,
      title: doc.data().title,
      content: doc.data().content || "",
      type: doc.data().type,
      status:
        doc.data()?.status === "todo" ? "to-do" : doc.data()?.status || null,
      priority: doc.data()?.priority || null,
      term: convertToDate(doc.data().term),
      date: convertToDate(doc.data().date) || new Date(),
      tags: doc.data()?.tags || [],
    }));

    const filteredNotes: Note[] = notes.filter((note) => {
      const matchesType = filters.type ? note.type === filters.type : true;
      const matchesStatus = filters.status
        ? note.status === filters.status
        : true;
      const matchesPriority = filters.priority
        ? note.priority === filters.priority
        : true;
      const matchesTags =
        filters.tags.length > 0
          ? filters.tags.every((tag) => note.tags.includes(tag))
          : true;
      const matchesDateRange = filters.dateRange
        ? note.date &&
          (!filters.dateRange.from || note.date >= filters.dateRange.from) &&
          (!filters.dateRange.to || note.date <= filters.dateRange.to)
        : true;
      const matchesSearchText = filters.searchText
        ? note.title
            .toLowerCase()
            .includes(filters.searchText?.toLowerCase()) ||
          note.content?.toLowerCase().includes(filters.searchText.toLowerCase())
        : true;

      return (
        matchesType &&
        matchesStatus &&
        matchesPriority &&
        matchesTags &&
        matchesDateRange &&
        matchesSearchText
      );
    });

    return filteredNotes;
  } catch (error) {
    console.error("Erro ao obter notas:", error);
    throw error;
  }
};

export const getTags = async (uid: string) => {
  try {
    const tagsRef = collection(db, "tags");
    const q = query(tagsRef, where("userId", "==", uid));
    const snapshot = await getDocs(q);
    const tags = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name as string,
    }));
    return tags;
  } catch (error) {
    console.error("Erro ao obter tags:", error);
    throw error;
  }
};

export const addTag = async (uid: string, tagName: string) => {
  try {
    const existingTags = await getTags(uid);
    const tagExists = existingTags.some(
      (tag) => tag.name.toLowerCase() === tagName.toLowerCase(),
    );
    if (tagExists) {
      throw new Error("Tag já existente");
    }

    const tagsRef = collection(db, "tags");

    const docRef = await addDoc(tagsRef, {
      userId: uid,
      name: tagName,
    });

    return {
      id: docRef.id,
      name: tagName,
    };
  } catch (error) {
    console.error("Erro ao adicionar tag:", error);
    throw error;
  }
};

export const deleteTag = async (uid: string, tagId: string) => {
  try {
    const tagRef = doc(db, "tags", tagId);
    await deleteDoc(tagRef);
  } catch (error) {
    console.error("Erro ao deletar tag:", error);
    throw error;
  }
};

export const addNote = async (
  uid: string,
  noteData: {
    title: string;
    content: string;
    type: "note" | "task";
    status?: string | null;
    priority?: string | null;
    term?: Date | null;
    tags?: string[];
  },
) => {
  try {
    const isTask = noteData.type === "task";
    const dataToSave = {
      userId: uid,
      title: noteData.title,
      content: noteData.content,
      type: noteData.type,
      status: isTask ? (noteData.status || "to-do") : null,
      priority: isTask ? (noteData.priority || null) : null,
      term: isTask ? (noteData.term || null) : null,
      tags: noteData.tags || [],
      date: new Date(),
    };

    const docRef = await addDoc(notesRef, dataToSave);

    return {
      id: docRef.id,
      uid,
      title: dataToSave.title,
      content: dataToSave.content,
      type: dataToSave.type,
      status: dataToSave.status,
      priority: dataToSave.priority,
      term: dataToSave.term,
      tags: dataToSave.tags,
      date: dataToSave.date,
    };
  } catch (error) {
    console.error("Erro ao adicionar nota/tarefa:", error);
    throw error;
  }
};

export const updateNote = async (
  uid: string,
  noteId: string,
  noteData: {
    title: string;
    content: string;
    type: "note" | "task";
    status?: string | null;
    priority?: string | null;
    term?: Date | null;
    tags?: string[];
  },
) => {
  try {
    const isTask = noteData.type === "task";
    const dataToSave = {
      title: noteData.title,
      content: noteData.content,
      type: noteData.type,
      status: isTask ? (noteData.status || "to-do") : null,
      priority: isTask ? (noteData.priority || null) : null,
      term: isTask ? (noteData.term || null) : null,
      tags: noteData.tags || [],
    };

    const noteRef = doc(db, "notes", noteId);
    await updateDoc(noteRef, dataToSave);

    return {
      id: noteId,
      uid,
      title: dataToSave.title,
      content: dataToSave.content,
      type: dataToSave.type,
      status: dataToSave.status,
      priority: dataToSave.priority,
      term: dataToSave.term,
      tags: dataToSave.tags,
    };
  } catch (error) {
    console.error("Erro ao atualizar nota/tarefa:", error);
    throw error;
  }
};

export const deleteNote = async (uid: string, noteId: string) => {
  try {
    const noteRef = doc(db, "notes", noteId);
    await deleteDoc(noteRef);
  } catch (error) {
    console.error("Erro ao deletar nota/tarefa:", error);
    throw error;
  }
};
