import { supabase } from '../supabaseClient';

export const base44 = {
  auth: {
    async me() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      return { ...user, ...profile, email: user.email };
    },
    async updateMe(data) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');
      
      const { data: updated, error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      return updated;
    },
    async logout(redirectTo = '/') {
      await supabase.auth.signOut();
      window.location.href = redirectTo;
    }
  },
  entities: {
    MediaContent: {
      async filter(params, order = '-created_date', limit = 50) {
        let query = supabase.from('media_content').select('*');
        for (const [k, v] of Object.entries(params)) {
          query = query.eq(k, v);
        }
        
        const orderColumn = order.startsWith('-') ? order.slice(1) : order;
        // Map created_date to created_at if needed, but let's assume table has created_date or created_at
        const actualOrderColumn = orderColumn === 'created_date' ? 'created_at' : orderColumn;
        
        query = query.order(actualOrderColumn, { ascending: !order.startsWith('-') });
        query = query.limit(limit);
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      async list(order = '-created_date', limit = 50) {
         return this.filter({}, order, limit);
      },
      async create(data) {
        const { data: created, error } = await supabase
          .from('media_content')
          .insert(data)
          .select()
          .single();
        if (error) throw error;
        return created;
      },
      async delete(id) {
        const { error } = await supabase.from('media_content').delete().eq('id', id);
        if (error) throw error;
      }
    },
    Payment: {
      async filter(params, order = '-created_date', limit = 50) {
        let query = supabase.from('payments').select('*');
        for (const [k, v] of Object.entries(params)) {
          query = query.eq(k, v);
        }
        const orderColumn = order.startsWith('-') ? order.slice(1) : order;
        const actualOrderColumn = orderColumn === 'created_date' ? 'created_at' : orderColumn;
        
        query = query.order(actualOrderColumn, { ascending: !order.startsWith('-') });
        query = query.limit(limit);
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      },
      async list(order = '-created_date', limit = 50) {
        return this.filter({}, order, limit);
      }
    },
    User: {
      async list(order = '-created_date', limit = 50) {
        let query = supabase.from('profiles').select('*');
        const orderColumn = order.startsWith('-') ? order.slice(1) : order;
        const actualOrderColumn = orderColumn === 'created_date' ? 'created_at' : orderColumn;
        
        query = query.order(actualOrderColumn, { ascending: !order.startsWith('-') });
        query = query.limit(limit);
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      }
    }
  },
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const ext = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
        
        const { data, error } = await supabase.storage
          .from('historias')
          .upload(fileName, file);
          
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('historias')
          .getPublicUrl(fileName);
          
        return { file_url: urlData.publicUrl };
      }
    }
  }
};
