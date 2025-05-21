// src/controllers/exampleController.ts
import { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

// Example function to fetch data from Supabase
export const getExampleData = async (req: Request, res: Response) => {
  try {
    // Replace 'example_table' with your actual table name
    const { data, error } = await supabase
      .from('example_table')
      .select('*')
      .limit(10);
      
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

// Example function to create data in Supabase
export const createExampleData = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and content are required' 
      });
    }
    
    // Replace 'example_table' with your actual table name
    const { data, error } = await supabase
      .from('example_table')
      .insert([{ title, content }])
      .select();
      
    if (error) throw error;
    
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error creating data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create data',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};